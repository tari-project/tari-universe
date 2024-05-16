use tari_wallet_daemon_client::types::AccountsGetBalancesResponse;
use tauri::{ self, State };

use crate::{
  database::{
    models::{
      CreateDevTapplet,
      CreateInstalledTapplet,
      CreateTapplet,
      CreateTappletVersion,
      DevTapplet,
      InstalledTapplet,
      Tapplet,
      UpdateInstalledTapplet,
      UpdateTapplet,
    },
    store::{ SqliteStore, Store },
  },
  hash_calculator::calculate_checksum,
  interface::{ DevTappletResponse, InstalledTappletWithName, RegistedTappletWithVersion, RegisteredTapplets },
  rpc::{ balances, free_coins, make_request },
  tapplet_installer::{ check_extracted_files, delete_tapplet, download_file, extract_tar },
  tapplet_server::start,
  DatabaseConnection,
  ShutdownTokens,
  Tokens,
};
use tauri_plugin_http::reqwest::{ self };

#[tauri::command]
pub async fn get_free_coins(tokens: State<'_, Tokens>) -> Result<(), ()> {
  let permission_token = tokens.permission.lock().unwrap().clone();
  let auth_token = tokens.auth.lock().unwrap().clone();
  let handle = tauri::async_runtime::spawn(async move { free_coins(auth_token, permission_token).await.unwrap() });
  handle.await.unwrap();
  Ok(())
}

#[tauri::command]
pub async fn get_balances(tokens: State<'_, Tokens>) -> Result<AccountsGetBalancesResponse, ()> {
  let permission_token = tokens.permission.lock().unwrap().clone();
  let auth_token = tokens.auth.lock().unwrap().clone();
  let handle = tauri::async_runtime::spawn(async move { balances(auth_token, permission_token).await.unwrap() });
  let balances = handle.await.unwrap();

  Ok(balances)
}

#[tauri::command]
pub async fn launch_tapplet(
  installed_tapplet_id: i32,
  shutdown_tokens: State<'_, ShutdownTokens>,
  db_connection: State<'_, DatabaseConnection>
) -> Result<String, ()> {
  let mut locked_tokens = shutdown_tokens.0.lock().await;
  let mut store = SqliteStore::new(db_connection.0.clone());

  let installed_tapplet = store.get_installed_tapplet_full_by_id(installed_tapplet_id).unwrap();
  let tapplet_path = format!("{}/{}/package/dist", installed_tapplet.1.registry_id, installed_tapplet.1.id.unwrap());
  let tapplet_handle = tauri::async_runtime::spawn(async move { start(&tapplet_path).await });

  let (addr, cancel_token) = tapplet_handle.await.unwrap();
  match locked_tokens.insert(installed_tapplet_id.clone(), cancel_token) {
    Some(_) => {
      println!("Tapplet already running with id: {}", installed_tapplet_id.clone());
    }
    None => {
      println!("Tapplet started with id: {}", installed_tapplet_id.clone());
    }
  }
  Ok(format!("http://{}", addr))
}

#[tauri::command]
pub async fn close_tapplet(installed_tapplet_id: i32, shutdown_tokens: State<'_, ShutdownTokens>) -> Result<(), ()> {
  let mut lock = shutdown_tokens.0.lock().await;
  match lock.get(&installed_tapplet_id) {
    Some(token) => {
      token.cancel();
      lock.remove(&installed_tapplet_id);
      println!("Tapplet stopped with id: {}", installed_tapplet_id.clone());
    }
    None => {
      println!("Tapplet not found with id: {}", installed_tapplet_id.clone());
    }
  }

  Ok(())
}

#[tauri::command]
pub async fn call_wallet(method: String, params: String, tokens: State<'_, Tokens>) -> Result<serde_json::Value, ()> {
  let permission_token = tokens.permission.lock().unwrap().clone();
  let req_params: serde_json::Value = serde_json::from_str(&params).unwrap();
  let handle = tauri::async_runtime::spawn(async move {
    make_request(Some(permission_token), method, req_params).await.unwrap()
  });
  let response = handle.await.unwrap();
  Ok(response)
}

#[tauri::command]
pub async fn download_and_extract_tapp(
  tapplet_id: i32,
  db_connection: State<'_, DatabaseConnection>
) -> Result<(), ()> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let (tapp, version_data) = tapplet_store.get_registered_tapplet_with_version(tapplet_id).unwrap();

  let url = version_data.registry_url;
  let tapplet_path = format!("../tapplets_installed/{}/{}", tapp.registry_id, version_data.version);
  let extract_path = tapplet_path.clone();

  // download tarball
  let handle = tauri::async_runtime::spawn(async move { download_file(&url, &tapplet_path).await });
  let _ = handle.await.unwrap();

  //extract tarball
  let _ = extract_tapp_tarball(&extract_path);
  let _ = check_tapp_files(&extract_path);
  Ok(())
}

#[tauri::command]
pub fn extract_tapp_tarball(tapplet_path: &str) -> Result<(), ()> {
  extract_tar(tapplet_path).unwrap();
  Ok(())
}

#[tauri::command]
pub fn calculate_and_validate_tapp_checksum(
  tapplet_id: i32,
  db_connection: State<'_, DatabaseConnection>
) -> Result<bool, bool> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let (tapp, version_data) = tapplet_store.get_registered_tapplet_with_version(tapplet_id).unwrap();
  let tapplet_path = format!("../tapplets_installed/{}/{}", tapp.registry_id, version_data.version);

  // calculate `integrity` from downloaded tarball file
  let integrity = calculate_checksum(&tapplet_path).unwrap();
  // check if the calculated chechsum is equal to the value stored in the registry
  let validity: bool = integrity == version_data.integrity;

  Ok(validity)
}

#[tauri::command]
pub fn check_tapp_files(tapplet_path: &str) -> Result<(), ()> {
  let _ = check_extracted_files(tapplet_path);
  Ok(())
}

/**
 * TAPPLETS REGISTRY - STORES ALL REGISTERED TAPPLETS IN THE TARI UNIVERSE
 */

#[tauri::command]
pub fn insert_tapp_registry_db(tapplet: CreateTapplet, db_connection: State<'_, DatabaseConnection>) -> Result<(), ()> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  tapplet_store.create(&tapplet);
  Ok(())
}

#[tauri::command]
pub fn read_tapp_registry_db(db_connection: State<'_, DatabaseConnection>) -> Result<Vec<Tapplet>, ()> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let tapplets: Vec<Tapplet> = tapplet_store.get_all();
  Ok(tapplets)
}

/**
 *  REGISTERED TAPPLETS - FETCH DATA FROM MANIFEST JSON
 */
#[tauri::command]
pub fn fetch_tapplets(db_connection: State<'_, DatabaseConnection>) -> Result<(), ()> {
  let registry = include_str!("../../tapplets-registry.manifest.json");
  let tapplets: RegisteredTapplets = serde_json::from_str(registry).unwrap();
  let mut store = SqliteStore::new(db_connection.0.clone());
  tapplets.registered_tapplets.iter().for_each(|(_, tapplet_manifest)| {
    let inserted_tapplet = store.create(&CreateTapplet::from(tapplet_manifest));
    let tapplet_db_id = inserted_tapplet.iter().next().unwrap().id.unwrap();

    tapplet_manifest.versions.iter().for_each(|(version, version_data)| {
      store.create(
        &(CreateTappletVersion {
          tapplet_id: Some(tapplet_db_id),
          version: &version,
          integrity: &version_data.integrity,
          registry_url: &version_data.registry_url,
        })
      );
    });
  });
  Ok(())
}

#[tauri::command]
pub fn update_tapp_registry_db(db_connection: State<'_, DatabaseConnection>) -> Result<(), ()> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let new_tapplet = UpdateTapplet {
    image_id: None,
    display_name: "updated_value".to_string(),
    package_name: "updated_value".to_string(),
    about_description: "updated_value".to_string(),
    about_summary: "updated_value".to_string(),
    author_name: "updated_value".to_string(),
    author_website: "updated_value".to_string(),
    category: "updated_value".to_string(),
    registry_id: "updated_value".to_string(),
  };
  let tapplets: Vec<Tapplet> = tapplet_store.get_all();
  let first: Tapplet = tapplets.into_iter().next().unwrap();
  tapplet_store.update(first, &new_tapplet);
  Ok(())
}

#[tauri::command]
pub fn get_by_id_tapp_registry_db(
  tapplet_id: i32,
  db_connection: State<'_, DatabaseConnection>
) -> Result<Tapplet, ()> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let tapplet: Option<Tapplet> = tapplet_store.get_by_id(tapplet_id);
  match tapplet {
    Some(tapp) => Ok(tapp),
    None => Err(()),
  }
}

#[tauri::command]
pub fn get_registered_tapp_with_version(
  tapplet_id: i32,
  db_connection: State<'_, DatabaseConnection>
) -> Result<RegistedTappletWithVersion, ()> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let (tapp, version_data) = tapplet_store.get_registered_tapplet_with_version(tapplet_id).unwrap();
  let registered_with_version = RegistedTappletWithVersion {
    registered_tapp: tapp,
    tapp_version: version_data,
  };
  Ok(registered_with_version)
}

/**
 * INSTALLED TAPPLETS - STORES ALL THE USER'S INSTALLED TAPPLETS
 */

#[tauri::command]
pub fn insert_installed_tapp_db(tapplet_id: i32, db_connection: State<'_, DatabaseConnection>) -> Result<(), ()> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let (tapp, version_data) = tapplet_store.get_registered_tapplet_with_version(tapplet_id).unwrap();

  let installed_tapplet = CreateInstalledTapplet {
    tapplet_id: tapp.id,
    tapplet_version_id: version_data.id,
  };
  tapplet_store.create(&installed_tapplet);
  Ok(())
}

#[tauri::command]
pub fn read_installed_tapp_db(
  db_connection: State<'_, DatabaseConnection>
) -> Result<Vec<InstalledTappletWithName>, ()> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let tapplets: Vec<InstalledTappletWithName> = tapplet_store.get_installed_tapplets_with_display_name();
  Ok(tapplets)
}

#[tauri::command]
pub fn update_installed_tapp_db(
  tapplet: UpdateInstalledTapplet,
  db_connection: State<'_, DatabaseConnection>
) -> Result<(), ()> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let tapplets: Vec<InstalledTapplet> = tapplet_store.get_all();
  let first: InstalledTapplet = tapplets.into_iter().next().unwrap();
  tapplet_store.update(first, &tapplet);
  Ok(())
}

#[tauri::command]
pub fn delete_installed_tapp_db(tapplet_id: i32, db_connection: State<'_, DatabaseConnection>) -> Result<(), ()> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let installed_tapplet: Option<InstalledTapplet> = tapplet_store.get_by_id(tapplet_id);
  match installed_tapplet {
    Some(tapp) => {
      tapplet_store.delete(tapp);
      return Ok(());
    }
    None => Err(()),
  }
}

#[tauri::command]
pub fn delete_installed_tapp(tapplet_id: i32, db_connection: State<'_, DatabaseConnection>) -> Result<(), ()> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());

  let installed_tapplet = tapplet_store.get_installed_tapplet_full_by_id(tapplet_id).unwrap();
  let tapplet_path = format!(
    "../tapplets_installed/{}/{}",
    installed_tapplet.1.registry_id,
    installed_tapplet.2.version
  );

  delete_tapplet(&tapplet_path).unwrap();
  return Ok(());
}

#[tauri::command]
pub async fn add_dev_tapplet(endpoint: String, db_connection: State<'_, DatabaseConnection>) -> Result<(), ()> {
  let manifest_endpoint = format!("{}/tapplet.manifest.json", endpoint);
  let manifest_res = reqwest::get(&manifest_endpoint).await.unwrap().json::<DevTappletResponse>().await.unwrap();
  let mut store = SqliteStore::new(db_connection.0.clone());
  let new_dev_tapplet = CreateDevTapplet {
    endpoint: &endpoint,
    package_name: &manifest_res.id,
    tapplet_name: &manifest_res.name,
    display_name: &manifest_res.display_name,
  };

  store.create(&new_dev_tapplet);
  Ok(())
}

#[tauri::command]
pub fn read_dev_tapplets(db_connection: State<'_, DatabaseConnection>) -> Result<Vec<DevTapplet>, ()> {
  let mut store = SqliteStore::new(db_connection.0.clone());
  let dev_tapplets: Vec<DevTapplet> = store.get_all();
  Ok(dev_tapplets)
}

#[tauri::command]
pub fn delete_dev_tapplet(dev_tapplet_id: i32, db_connection: State<'_, DatabaseConnection>) -> Result<(), ()> {
  let mut store = SqliteStore::new(db_connection.0.clone());
  let dev_tapplet: Option<DevTapplet> = store.get_by_id(dev_tapplet_id);
  match dev_tapplet {
    Some(tapp) => {
      store.delete(tapp);
      return Ok(());
    }
    None => Err(()),
  }
}
