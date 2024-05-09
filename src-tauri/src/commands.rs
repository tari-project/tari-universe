use tari_wallet_daemon_client::types::AccountsGetBalancesResponse;
use tauri::{ self, State };

use crate::{
  database::{ models::{ CreateTapplet, CreateTappletVersion }, store::{ SqliteStore, Store } },
  interface::VerifiedTapplets,
  hash_calculator::calculate_shasum,
  rpc::{ balances, free_coins, make_request },
  tapplet_installer::{ check_extracted_files, download_file, extract_tar, validate_checksum },
  tapplet_server::start,
  DatabaseConnection,
  ShutdownTokens,
  Tokens,
};

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
  tapplet_id: i32,
  shutdown_tokens: State<'_, ShutdownTokens>,
  db_connection: State<'_, DatabaseConnection>
) -> Result<String, ()> {
  let mut locked_tokens = shutdown_tokens.0.lock().await;
  let mut store = SqliteStore::new(db_connection.0.clone());

  let installed_tapplet = store.get_installed_tapplet_by_registry_id(tapplet_id);
  let tapplet_handle = tauri::async_runtime::spawn(async { start(&installed_tapplet.path_to_dist.unwrap()).await });

  let (addr, cancel_token) = tapplet_handle.await.unwrap();
  match locked_tokens.insert(tapplet_id.clone(), cancel_token) {
    Some(_) => {
      println!("Tapplet already running with id: {}", tapplet_id.clone());
    }
    None => {
      println!("Tapplet started with id: {}", tapplet_id.clone());
    }
  }
  Ok(format!("http://{}", addr))
}

#[tauri::command]
pub async fn close_tapplet(tapplet_id: i32, shutdown_tokens: State<'_, ShutdownTokens>) -> Result<(), ()> {
  let mut lock = shutdown_tokens.0.lock().await;
  match lock.get(&tapplet_id) {
    Some(token) => {
      token.cancel();
      lock.remove(&tapplet_id);
      println!("Tapplet stopped with id: {}", tapplet_id.clone());
    }
    None => {
      println!("Tapplet not found with id: {}", tapplet_id.clone());
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
pub async fn download_tapp(url: String, tapplet_path: String) -> Result<(), ()> {
  let handle = tauri::async_runtime::spawn(async move { download_file(url.clone(), tapplet_path.clone()).await });
  let _ = handle.await.unwrap();
  Ok(())
}

#[tauri::command]
pub fn extract_tapp_tarball(tapplet_path: &str) -> Result<(), ()> {
  extract_tar(tapplet_path).unwrap();
  Ok(())
}

#[tauri::command]
pub fn calculate_tapp_checksum(tapplet_path: &str) -> Result<String, String> {
  let response = calculate_shasum(tapplet_path).unwrap();
  Ok(response)
}

#[tauri::command]
pub fn validate_tapp_checksum(checksum: &str, tapplet_path: &str) -> Result<bool, bool> {
  let response = validate_checksum(checksum, tapplet_path);
  Ok(response)
}

#[tauri::command]
pub fn check_tapp_files(tapplet_path: &str) -> Result<(), ()> {
  let _ = check_extracted_files(tapplet_path);
  Ok(())
}

#[tauri::command]
pub fn fetch_tapplets(db_connection: State<'_, DatabaseConnection>) -> Result<(), ()> {
  let registry = include_str!("../../registry.json");
  let tapplets: VerifiedTapplets = serde_json::from_str(registry).unwrap();
  let mut store = SqliteStore::new(db_connection.0.clone());
  tapplets.verified_tapplets.iter().for_each(|(_, tapplet_manifest)| {
    let inserted_tapplet = store.create(&CreateTapplet::from(tapplet_manifest));
    let tapplet_db_id = inserted_tapplet.iter().next().unwrap().id.unwrap();

    tapplet_manifest.versions.iter().for_each(|(version, checksum)| {
      store.create(
        &(CreateTappletVersion {
          tapplet_id: Some(tapplet_db_id),
          version: &version,
          checksum: &checksum.checksum,
        })
      );
    });
  });
  Ok(())
}
