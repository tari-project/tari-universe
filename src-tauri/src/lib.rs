use diesel::SqliteConnection;
use std::{ collections::HashMap, env, sync::{ Arc, Mutex } };
use tauri::{ self, Manager };
use tokio_util::sync::CancellationToken;

mod commands;
mod database;
mod hash_calculator;
mod rpc;
mod tapplet_installer;
mod tapplet_server;
mod wallet_daemon;
mod interface;

use commands::{
  calculate_tapp_checksum,
  call_wallet,
  check_tapp_files,
  close_tapplet,
  download_tapp,
  extract_tapp_tarball,
  get_balances,
  get_free_coins,
  launch_tapplet,
  validate_tapp_checksum,
  fetch_tapplets,
};

use crate::{ rpc::permission_token, wallet_daemon::start_wallet_daemon };

pub struct Tokens {
  auth: Mutex<String>,
  permission: Mutex<String>,
}
#[derive(Default)]
pub struct ShutdownTokens(Arc<tokio::sync::Mutex<HashMap<i32, CancellationToken>>>);
pub struct DatabaseConnection(Arc<Mutex<SqliteConnection>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder
    ::default()
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_shell::init())
    .manage(Tokens {
      permission: Mutex::new("".to_string()),
      auth: Mutex::new("".to_string()),
    })
    .manage(ShutdownTokens::default())
    .manage(DatabaseConnection(Arc::new(Mutex::new(database::establish_connection()))))
    .invoke_handler(
      tauri::generate_handler![
        get_free_coins,
        get_balances,
        launch_tapplet,
        close_tapplet,
        call_wallet,
        download_tapp,
        calculate_tapp_checksum,
        validate_tapp_checksum,
        check_tapp_files,
        extract_tapp_tarball,
        fetch_tapplets
      ]
    )
    .setup(|app| {
      tauri::async_runtime::spawn(async move {
        start_wallet_daemon().await.unwrap();
      }); // TODO wait for wallet daemon to start responding https://github.com/orgs/tari-project/projects/18/views/1?pane=issue&itemId=62414850

      let handle = tauri::async_runtime::spawn(async move { permission_token().await.unwrap() });
      let (permission_token, auth_token) = tauri::async_runtime::block_on(handle).unwrap();
      let tokens = app.state::<Tokens>();
      tokens.permission
        .lock()
        .unwrap()
        .replace_range(.., &permission_token);
      tokens.auth
        .lock()
        .unwrap()
        .replace_range(.., &auth_token);

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
