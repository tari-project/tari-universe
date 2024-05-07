use tari_wallet_daemon_client::types::AccountsGetBalancesResponse;
use tauri::{ self, State };

use crate::{
  database::{ models::{ CreateTapplet, Tapplet, UpdateTapplet }, store::{ SqliteStore, Store } },
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
pub async fn launch_tapplet(tapplet_id: String, shutdown_tokens: State<'_, ShutdownTokens>) -> Result<String, ()> {
  let mut locked_tokens = shutdown_tokens.0.lock().await;
  let tapplet_handle = tauri::async_runtime::spawn(async { start().await });
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
pub async fn close_tapplet(tapplet_id: String, shutdown_tokens: State<'_, ShutdownTokens>) -> Result<(), ()> {
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
pub fn insert_db(db_connection: State<'_, DatabaseConnection>) -> Result<(), ()> {
  let new_tapplet = CreateTapplet {
    description: "test",
    display_name: "test",
    image_id: None,
    package_name: "test",
    version: "test",
  };

  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  tapplet_store.create(&new_tapplet);
  Ok(())
}

#[tauri::command]
pub fn read_db(db_connection: State<'_, DatabaseConnection>) -> Result<(), ()> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let tapplets: Vec<Tapplet> = tapplet_store.get_all();
  for tapplet in tapplets {
    println!("{:?}", tapplet);
  }
  Ok(())
}

#[tauri::command]
pub fn update_db(db_connection: State<'_, DatabaseConnection>) -> Result<(), ()> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let new_tapplet = UpdateTapplet {
    description: "test2".to_string(),
    display_name: "test2".to_string(),
    image_id: None,
    package_name: "test2".to_string(),
    version: "test2".to_string(),
  };
  let tapplets: Vec<Tapplet> = tapplet_store.get_all();
  let first: Tapplet = tapplets.into_iter().next().unwrap();
  tapplet_store.update(first, &new_tapplet);
  Ok(())
}

#[tauri::command]
pub fn delete_db(db_connection: State<'_, DatabaseConnection>) -> Result<(), ()> {
  let mut tapplet_store = SqliteStore::new(db_connection.0.clone());
  let tapplets: Vec<Tapplet> = tapplet_store.get_all();
  let first: Tapplet = tapplets.into_iter().next().unwrap();
  tapplet_store.delete(first);
  Ok(())
}
