use log::{ error, info };
use tari_wallet_daemon_client::types::AccountsGetBalancesResponse;
use tauri::{ self, AppHandle, Manager, State };

use crate::{
  constants::{ TAPPLET_ARCHIVE, TAPPLET_DIST_DIR },
  database::{
    models::{
      CreateDevTapplet,
      CreateInstalledTapplet,
      CreateTapplet,
      CreateTappletAsset,
      CreateTappletVersion,
      DevTapplet,
      InstalledTapplet,
      Tapplet,
      UpdateInstalledTapplet,
      UpdateTapplet,
    },
    store::{ SqliteStore, Store },
  },
  download_utils::{ download_file_with_retries, extract },
  error::{
    Error::{ self, FailedToObtainPermissionTokenLock, IOError, JsonParsingError, RequestError, TappletServerError },
    IOError::*,
    RequestError::*,
    TappletServerError::*,
  },
  interface::{
    DevTappletResponse,
    InstalledTappletWithName,
    LaunchedTappResult,
    RegisteredTappletWithVersion,
    TappletPermissions,
  },
  progress_tracker::ProgressTracker,
  rpc::{ account_create, balances, free_coins, make_request },
  tapplet_installer::{
    check_files_and_validate_checksum,
    delete_tapplet,
    download_asset,
    fetch_tapp_registry_manifest,
    get_tapp_download_path,
    get_tapp_permissions,
  },
  tapplet_server::start,
  AssetServer,
  DatabaseConnection,
  ShutdownTokens,
  Tokens,
};
use tauri_plugin_http::reqwest::{ self };
pub const LOG_TARGET: &str = "tari::universe";

#[tauri::command]
pub async fn create_account(tokens: State<'_, Tokens>) -> Result<(), Error> {
  // Use default account
  let account_name = "default".to_string();
  let permission_token = tokens.permission
    .lock()
    .map_err(|_| FailedToObtainPermissionTokenLock)?
    .clone();
  match account_create(Some(account_name), permission_token).await {
    Ok(_) => (),
    Err(e) => {
      return Err(Error::RequestFailed { message: e.to_string() });
    }
  }
  Ok(())
}

#[tauri::command]
pub async fn get_free_coins(tokens: State<'_, Tokens>) -> Result<(), Error> {
  // Use default account
  let account_name = "default".to_string();
  let permission_token = tokens.permission
    .lock()
    .map_err(|_| FailedToObtainPermissionTokenLock)?
    .clone();
  match free_coins(Some(account_name), permission_token).await {
    Ok(_) => (),
    Err(e) => {
      return Err(Error::RequestFailed { message: e.to_string() });
    }
  }
  Ok(())
}

#[tauri::command]
pub async fn get_balances(tokens: State<'_, Tokens>) -> Result<AccountsGetBalancesResponse, Error> {
  // Use default account
  let account_name = "default".to_string();
  let permission_token = tokens.permission
    .lock()
    .map_err(|_| FailedToObtainPermissionTokenLock)?
    .clone();

  match balances(Some(account_name), permission_token).await {
    Ok(res) => Ok(res),
    Err(e) => {
      return Err(Error::RequestFailed { message: e.to_string() });
    }
  }
}

#[tauri::command]
pub async fn call_wallet(
  method: String,
  params: String,
  tokens: State<'_, Tokens>
) -> Result<serde_json::Value, Error> {
  let permission_token = tokens.permission
    .lock()
    .inspect_err(|e| error!(target: LOG_TARGET, "❌ Error at call_wallet: {:?}", e))
    .map_err(|_| FailedToObtainPermissionTokenLock)?
    .clone();
  let req_params: serde_json::Value = serde_json
    ::from_str(&params)
    .inspect_err(|e| error!(target: LOG_TARGET, "❌ Error at call_wallet: {:?}", e))
    .map_err(|e| JsonParsingError(e))?;
  match make_request(Some(permission_token), method, req_params).await {
    Ok(res) => Ok(res),
    Err(e) => {
      error!(target: LOG_TARGET,"❌ Error at call_wallet: {:?}", e);
      return Err(Error::RequestFailed { message: e.to_string() });
    }
  }
}

#[tauri::command]
pub async fn launch_tapplet(
  installed_tapplet_id: i32,
  shutdown_tokens: State<'_, ShutdownTokens>,
  db_connection: State<'_, DatabaseConnection>,
  app_handle: tauri::AppHandle
) -> Result<LaunchedTappResult, Error> {
  let mut locked_tokens = shutdown_tokens.0.lock().await;
  let mut store = SqliteStore::new(db_connection.0.clone());

  let (_installed_tapp, registered_tapp, tapp_version) = store.get_installed_tapplet_full_by_id(installed_tapplet_id)?;
  // get download path
  let tapplet_path = get_tapp_download_path(
    registered_tapp.registry_id,
    tapp_version.version.clone(),
    app_handle.clone()
  ).unwrap();
  let file_path = tapplet_path.join(TAPPLET_ARCHIVE);

  // Extract the tapplet archieve each time before launching
  // This way make sure that local files have not been replaced and are not malicious
  let _ = extract(&file_path, &tapplet_path.clone()).await
    .inspect_err(|e| error!(target: LOG_TARGET, "❌ Error extracting file: {:?}", e))
    .map_err(|_| { IOError(FailedToUnpackFile { path: tapplet_path.to_string_lossy().to_string() }) })?;
  //TODO should compare integrity field with the one stored in db or from github manifest?
  match check_files_and_validate_checksum(tapp_version, tapplet_path.clone()) {
    Ok(is_valid) => {
      info!(target: LOG_TARGET,"✅ Checksum validation successfully with test result: {:?}", is_valid);
    }
    Err(e) => {
      error!(target: LOG_TARGET,"❌ Error validating checksum: {:?}", e);
      return Err(e.into());
    }
  }

  let permissions: TappletPermissions = match get_tapp_permissions(tapplet_path.clone()) {
    Ok(p) => p,
    Err(e) => {
      error!(target: LOG_TARGET,"Error getting permissions: {:?}", e);
      return Err(e.into());
    }
  };

  let dist_path = tapplet_path.join(TAPPLET_DIST_DIR);
  let handle_start = tauri::async_runtime::spawn(async move { start(dist_path).await });

  let (addr, cancel_token) = handle_start.await??;
  match locked_tokens.insert(installed_tapplet_id.clone(), cancel_token) {
    Some(_) => {
      return Err(TappletServerError(AlreadyRunning));
    }
    None => {}
  }

  Ok(LaunchedTappResult {
    endpoint: format!("http://{}", addr),
    permissions,
  })
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
      return Err(TappletServerError(TokenInvalid));
    }
  }

  Ok(())
}

#[tauri::command]
pub fn get_assets_server_addr(state: tauri::State<'_, AssetServer>) -> Result<String, String> {
  Ok(format!("http://{}", state.addr))
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
  let tapplet_path = get_tapp_download_path(
    tapp.registry_id.clone(),
    tapp_version.version.clone(),
    app_handle.clone()
  ).unwrap_or_default();
  // download tarball
  let url = tapp_version.registry_url.clone();
  let file_path = tapplet_path.join(TAPPLET_ARCHIVE);
  let destination_dir = file_path.clone();
  let progress_tracker = ProgressTracker::new(
    app_handle.get_window("main").expect("Could not get main window").clone()
  );
  let handle = tauri::async_runtime::spawn(async move {
    download_file_with_retries(&url, &destination_dir, progress_tracker).await
  });
  handle.await?.map_err(|_| Error::RequestError(FailedToDownload { url: tapp_version.registry_url.clone() }))?;

  let _ = extract(&file_path, &tapplet_path.clone()).await.inspect_err(
    |e| error!(target: LOG_TARGET, "❌ Error extracting file: {:?}", e)
  );
  //TODO should compare integrity field with the one stored in db or from github manifest?
  match check_files_and_validate_checksum(tapp_version, tapplet_path.clone()) {
    Ok(is_valid) => {
      info!(target: LOG_TARGET,"✅ Checksum validation successfully with test result: {:?}", is_valid);
    }
    Err(e) => {
      error!(target: LOG_TARGET,"🚨 Error validating checksum: {:?}", e);
      return Err(e.into());
    }
  }
  Ok(())
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
pub async fn fetch_tapplets(app_handle: AppHandle, db_connection: State<'_, DatabaseConnection>) -> Result<(), Error> {
  let tapplets = fetch_tapp_registry_manifest().await?;
  let mut store = SqliteStore::new(db_connection.0.clone());

  for tapplet_manifest in tapplets.registered_tapplets.values() {
    let inserted_tapplet = store.create(&CreateTapplet::from(tapplet_manifest))?;

    // for audit_data in tapplet_manifest.metadata.audits.iter() {
    //   store.create(
    //     &(CreateTappletAudit {
    //       tapplet_id: inserted_tapplet.id,
    //       auditor: &audit_data.auditor,
    //       report_url: &audit_data.report_url,
    //     })
    //   )?;
    // }

    for (version, version_data) in tapplet_manifest.versions.iter() {
      store.create(
        &(CreateTappletVersion {
          tapplet_id: inserted_tapplet.id,
          version: &version,
          integrity: &version_data.integrity,
          registry_url: &version_data.registry_url,
        })
      )?;
    }
    match store.get_tapplet_assets_by_tapplet_id(inserted_tapplet.id.unwrap())? {
      Some(_) => {}
      None => {
        let tapplet_assets = download_asset(app_handle.clone(), inserted_tapplet.registry_id).await?;
        store.create(
          &(CreateTappletAsset {
            tapplet_id: inserted_tapplet.id,
            icon_url: &tapplet_assets.icon_url,
            background_url: &tapplet_assets.background_url,
          })
        )?;
      }
    }
  }
  Ok(())
}

#[tauri::command]
pub async fn update_tapp(
  tapplet_id: i32,
  installed_tapplet_id: i32,
  db_connection: State<'_, DatabaseConnection>,
  app_handle: tauri::AppHandle
) -> Result<Vec<InstalledTappletWithName>, Error> {
  delete_installed_tapp(installed_tapplet_id, db_connection.clone(), app_handle.clone())?;
  download_and_extract_tapp(tapplet_id, db_connection.clone(), app_handle.clone()).await?;
  insert_installed_tapp_db(tapplet_id, db_connection.clone())?;

  let mut store = SqliteStore::new(db_connection.0.clone());
  let installed_tapplets = store.get_installed_tapplets_with_display_name()?;

  return Ok(installed_tapplets);
}

#[tauri::command]
pub fn update_tapp_registry_db(db_connection: State<'_, DatabaseConnection>) -> Result<usize, Error> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let new_tapplet = UpdateTapplet {
    display_name: "updated_value".to_string(),
    package_name: "updated_value".to_string(),
    logo_url: "updated_value".to_string(),
    background_url: "updated_value".to_string(),
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
pub fn delete_installed_tapp(
  tapplet_id: i32,
  db_connection: State<'_, DatabaseConnection>,
  app_handle: tauri::AppHandle
) -> Result<usize, Error> {
  let mut store = SqliteStore::new(db_connection.0.clone());
  let (_installed_tapp, registered_tapp, tapp_version) = store.get_installed_tapplet_full_by_id(tapplet_id)?;
  let tapplet_path = get_tapp_download_path(registered_tapp.registry_id, tapp_version.version, app_handle).unwrap();
  delete_tapplet(tapplet_path)?;

  let installed_tapplet: InstalledTapplet = store.get_by_id(tapplet_id)?;
  store.delete(installed_tapplet)
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
    package_name: &manifest_res.package_name,
    display_name: &manifest_res.display_name,
  };
  let dev_tapplet = store.create(&new_dev_tapplet);
  info!(target: LOG_TARGET,"✅ Dev tapplet added to db successfully: {:?}", new_dev_tapplet);
  dev_tapplet
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

#[tauri::command]
pub fn open_log_dir(app_handle: tauri::AppHandle) {
  let log_dir = app_handle.path().app_log_dir().expect("Could not get log dir");
  if let Err(e) = open::that(log_dir) {
    error!(target: LOG_TARGET, "❌ Could not open log dir: {:?}", e);
  }
}
