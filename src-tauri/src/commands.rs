use tari_wallet_daemon_client::types::AccountsGetBalancesResponse;
use tauri::{ self, State };
use std::path::PathBuf;

use crate::{
  database::{
    models::{
      CreateDevTapplet, CreateInstalledTapplet, CreateTapplet, CreateTappletAudit, CreateTappletVersion, DevTapplet, InstalledTapplet, Tapplet, UpdateInstalledTapplet, UpdateTapplet
    }, store::{ SqliteStore, Store }
  },
  error::{
    Error::{
      self, FailedToObtainPermissionTokenLock, JsonParsingError, RequestError, TappletServerError
    },
    RequestError::*,
    TappletServerError::*,
  },
  hash_calculator::calculate_checksum,
  interface::{ DevTappletResponse, InstalledTappletWithName, RegisteredTappletWithVersion, RegisteredTapplets },
  rpc::{ balances, free_coins, make_request },
  tapplet_installer::{ check_extracted_files, delete_tapplet, download_file, extract_tar, get_tapp_download_path },
  tapplet_server::start,
  DatabaseConnection,
  ShutdownTokens,
  Tokens,
};
use tauri_plugin_http::reqwest::{ self };

#[tauri::command]
pub async fn get_free_coins(tokens: State<'_, Tokens>) -> Result<(), Error> {
  // Use default account
  let auth_token = None;
  let permission_token = tokens.permission
    .lock()
    .map_err(|_| FailedToObtainPermissionTokenLock())?
    .clone();

  let handle = tauri::async_runtime::spawn(async move { free_coins(auth_token, permission_token).await.unwrap() });
  handle.await.unwrap();
  Ok(())
}

#[tauri::command]
pub async fn get_balances(tokens: State<'_, Tokens>) -> Result<AccountsGetBalancesResponse, Error> {
  // Use default account
  let auth_token = None;
  let permission_token = tokens.permission
    .lock()
    .map_err(|_| FailedToObtainPermissionTokenLock())?
    .clone();

  let handle = tauri::async_runtime::spawn(async move { balances(auth_token, permission_token).await });
  let balances = handle.await??;

  Ok(balances)
}

#[tauri::command]
pub async fn call_wallet(
  method: String,
  params: String,
  tokens: State<'_, Tokens>
) -> Result<serde_json::Value, Error> {
  let permission_token = tokens.permission
    .lock()
    .map_err(|_| FailedToObtainPermissionTokenLock())?
    .clone();
  let req_params: serde_json::Value = serde_json::from_str(&params).map_err(|e| JsonParsingError(e))?;
  let method_clone = method.clone();
  let handle = tauri::async_runtime::spawn(async move {
    make_request(Some(permission_token), method, req_params).await
  });
  let response = handle.await?.map_err(|_| Error::ProviderError { method: method_clone, params })?;
  Ok(response)
}

#[tauri::command]
pub async fn launch_tapplet(
  installed_tapplet_id: i32,
  shutdown_tokens: State<'_, ShutdownTokens>,
  db_connection: State<'_, DatabaseConnection>,
  app_handle: tauri::AppHandle
) -> Result<String, Error> {
  let mut locked_tokens = shutdown_tokens.0.lock().await;
  let mut store = SqliteStore::new(db_connection.0.clone());

  let (_installed_tapp, registered_tapp, tapp_version) = store
    .get_installed_tapplet_full_by_id(installed_tapplet_id)
    .unwrap();

  // get download path
  let tapplet_path = get_tapp_download_path(registered_tapp.registry_id, tapp_version.version, app_handle).unwrap();
  let dist_path = tapplet_path.join("package/dist");

  let handle_start = tauri::async_runtime::spawn(async move { start(dist_path).await });

  let (addr, cancel_token) = handle_start.await??;
  match locked_tokens.insert(installed_tapplet_id.clone(), cancel_token) {
    Some(_) => {
      return Err(TappletServerError(AlreadyRunning()));
    }
    None => {}
  }
  Ok(format!("http://{}", addr))
}

#[tauri::command]
pub async fn close_tapplet(installed_tapplet_id: i32, shutdown_tokens: State<'_, ShutdownTokens>) -> Result<(), Error> {
  let mut lock = shutdown_tokens.0.lock().await;
  match lock.get(&installed_tapplet_id) {
    Some(token) => {
      token.cancel();
      lock.remove(&installed_tapplet_id);
    }
    None => {
      return Err(TappletServerError(TokenInvalid()));
    }
  }

  Ok(())
}

#[tauri::command]
pub async fn download_and_extract_tapp(
  tapplet_id: i32,
  db_connection: State<'_, DatabaseConnection>,
  app_handle: tauri::AppHandle
) -> Result<(), Error> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let (tapp, tapp_version) = tapplet_store.get_registered_tapplet_with_version(tapplet_id)?;

  // get download path
  let tapplet_path = get_tapp_download_path(tapp.registry_id, tapp_version.version, app_handle).unwrap();

  // download tarball
  let url = tapp_version.registry_url.clone();
  let download_path = tapplet_path.clone();
  let handle = tauri::async_runtime::spawn(async move { download_file(&url, download_path).await });
  handle.await?.map_err(|_| Error::RequestError(FailedToDownload { url: tapp_version.registry_url }))?;

  //extract tarball
  let extract_path: PathBuf = tapplet_path.clone();
  extract_tar(extract_path)?;
  check_extracted_files(tapplet_path)?;
  Ok(())
}

#[tauri::command]
pub fn calculate_and_validate_tapp_checksum(
  tapplet_id: i32,
  db_connection: State<'_, DatabaseConnection>,
  app_handle: tauri::AppHandle
) -> Result<bool, Error> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let (tapp, version_data) = tapplet_store.get_registered_tapplet_with_version(tapplet_id)?;

  // get download path
  let tapplet_path = get_tapp_download_path(tapp.registry_id, version_data.version, app_handle).unwrap();

  // calculate `integrity` from downloaded tarball file
  let integrity = calculate_checksum(tapplet_path)?;
  // check if the calculated chechsum is equal to the value stored in the registry
  let validity: bool = integrity == version_data.integrity;

  Ok(validity)
}

/**
 * TAPPLETS REGISTRY - STORES ALL REGISTERED TAPPLETS IN THE TARI UNIVERSE
 */

#[tauri::command]
pub fn insert_tapp_registry_db(
  tapplet: CreateTapplet,
  db_connection: State<'_, DatabaseConnection>
) -> Result<Tapplet, Error> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  tapplet_store.create(&tapplet)
}

#[tauri::command]
pub fn read_tapp_registry_db(db_connection: State<'_, DatabaseConnection>) -> Result<Vec<Tapplet>, Error> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  tapplet_store.get_all()
}

/**
 *  REGISTERED TAPPLETS - FETCH DATA FROM MANIFEST JSON
 */
#[tauri::command]
pub async fn fetch_tapplets(db_connection: State<'_, DatabaseConnection>) -> Result<(), Error> {
  let manifest_endpoint = String::from("https://raw.githubusercontent.com/karczuRF/tapp-registry/main/tapplets-registry.manifest.json");
  let manifest_res = reqwest
    ::get(&manifest_endpoint).await
    .map_err(|_| RequestError(FetchManifestError { endpoint: manifest_endpoint.clone() }))?
    .text().await
    .map_err(|_| RequestError(ManifestResponseError { endpoint: manifest_endpoint.clone() }))?;

  let tapplets: RegisteredTapplets = serde_json::from_str(&manifest_res).map_err(|e| JsonParsingError(e))?;

  let mut store = SqliteStore::new(db_connection.0.clone());

  for tapplet_manifest in tapplets.registered_tapplets.values() {
    let inserted_tapplet = store.create(&CreateTapplet::from(tapplet_manifest))?;
    let tapplet_db_id = inserted_tapplet.id;

    for audit_data in tapplet_manifest.metadata.audits.iter() {
      store.create(
        &(CreateTappletAudit {
          tapplet_id: tapplet_db_id,
          auditor: &audit_data.auditor,
          report_url: &audit_data.report_url,
        })
      )?;
    }

    for (version, version_data) in tapplet_manifest.versions.iter() {
      store.create(
        &(CreateTappletVersion {
          tapplet_id: tapplet_db_id,
          version: &version,
          integrity: &version_data.integrity,
          registry_url: &version_data.registry_url,
          logo_url: &version_data.logo_url
        })
      )?;
    }
  }
  Ok(())
}

#[tauri::command]
pub fn update_tapp_registry_db(db_connection: State<'_, DatabaseConnection>) -> Result<usize, Error> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let new_tapplet = UpdateTapplet {
    display_name: "updated_value".to_string(),
    package_name: "updated_value".to_string(),
    about_description: "updated_value".to_string(),
    about_summary: "updated_value".to_string(),
    author_name: "updated_value".to_string(),
    author_website: "updated_value".to_string(),
    category: "updated_value".to_string(),
    registry_id: "updated_value".to_string(),
  };
  let tapplets: Vec<Tapplet> = tapplet_store.get_all()?;
  let first: Tapplet = tapplets.into_iter().next().unwrap();
  tapplet_store.update(first, &new_tapplet)
}

#[tauri::command]
pub fn get_by_id_tapp_registry_db(
  tapplet_id: i32,
  db_connection: State<'_, DatabaseConnection>
) -> Result<Tapplet, Error> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  tapplet_store.get_by_id(tapplet_id)
}

#[tauri::command]
pub fn get_registered_tapp_with_version(
  tapplet_id: i32,
  db_connection: State<'_, DatabaseConnection>
) -> Result<RegisteredTappletWithVersion, Error> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let (tapp, version_data) = tapplet_store.get_registered_tapplet_with_version(tapplet_id)?;
  let registered_with_version = RegisteredTappletWithVersion {
    registered_tapp: tapp,
    tapp_version: version_data,
  };
  Ok(registered_with_version)
}

/**
 * INSTALLED TAPPLETS - STORES ALL THE USER'S INSTALLED TAPPLETS
 */

#[tauri::command]
pub fn insert_installed_tapp_db(
  tapplet_id: i32,
  db_connection: State<'_, DatabaseConnection>
) -> Result<InstalledTapplet, Error> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let (tapp, version_data) = tapplet_store.get_registered_tapplet_with_version(tapplet_id)?;

  let installed_tapplet = CreateInstalledTapplet {
    tapplet_id: tapp.id,
    tapplet_version_id: version_data.id,
  };
  tapplet_store.create(&installed_tapplet)
}

#[tauri::command]
pub fn read_installed_tapp_db(
  db_connection: State<'_, DatabaseConnection>
) -> Result<Vec<InstalledTappletWithName>, Error> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  tapplet_store.get_installed_tapplets_with_display_name()
}

#[tauri::command]
pub fn update_installed_tapp_db(
  tapplet: UpdateInstalledTapplet,
  db_connection: State<'_, DatabaseConnection>
) -> Result<usize, Error> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let tapplets: Vec<InstalledTapplet> = tapplet_store.get_all()?;
  let first: InstalledTapplet = tapplets.into_iter().next().unwrap();
  tapplet_store.update(first, &tapplet)
}

#[tauri::command]
pub fn delete_installed_tapp_db(tapplet_id: i32, db_connection: State<'_, DatabaseConnection>) -> Result<usize, Error> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let installed_tapplet: InstalledTapplet = tapplet_store.get_by_id(tapplet_id)?;
  tapplet_store.delete(installed_tapplet)
}

#[tauri::command]
pub fn delete_installed_tapp(
  tapplet_id: i32,
  db_connection: State<'_, DatabaseConnection>,
  app_handle: tauri::AppHandle
) -> Result<(), Error> {
  let mut store = SqliteStore::new(db_connection.0.clone());

  let (_installed_tapp, registered_tapp, tapp_version) = store.get_installed_tapplet_full_by_id(tapplet_id)?;

  // get download path
  let tapplet_path = get_tapp_download_path(registered_tapp.registry_id, tapp_version.version, app_handle).unwrap();

  delete_tapplet(tapplet_path)
}

#[tauri::command]
pub async fn add_dev_tapplet(
  endpoint: String,
  db_connection: State<'_, DatabaseConnection>
) -> Result<DevTapplet, Error> {
  let manifest_endpoint = format!("{}/tapplet.manifest.json", endpoint);
  let manifest_res = reqwest
    ::get(&manifest_endpoint).await
    .map_err(|_| RequestError(FetchManifestError { endpoint: endpoint.clone() }))?
    .json::<DevTappletResponse>().await
    .map_err(|_| RequestError(ManifestResponseError { endpoint: endpoint.clone() }))?;
  let mut store = SqliteStore::new(db_connection.0.clone());
  let new_dev_tapplet = CreateDevTapplet {
    endpoint: &endpoint,
    package_name: &manifest_res.id,
    tapplet_name: &manifest_res.name,
    display_name: &manifest_res.display_name,
  };

  store.create(&new_dev_tapplet)
}

#[tauri::command]
pub fn read_dev_tapplets(db_connection: State<'_, DatabaseConnection>) -> Result<Vec<DevTapplet>, Error> {
  let mut store = SqliteStore::new(db_connection.0.clone());
  store.get_all()
}

#[tauri::command]
pub fn delete_dev_tapplet(dev_tapplet_id: i32, db_connection: State<'_, DatabaseConnection>) -> Result<usize, Error> {
  let mut store = SqliteStore::new(db_connection.0.clone());
  let dev_tapplet: DevTapplet = store.get_by_id(dev_tapplet_id)?;
  store.delete(dev_tapplet)
}
