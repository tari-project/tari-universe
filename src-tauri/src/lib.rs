use std::{ collections::HashMap, env, sync::{ Arc, Mutex } };
use tauri::{ self };
use tokio_util::sync::CancellationToken;

mod commands;
mod rpc;
mod tapplet_server;
mod wallet_daemon;
mod tapplet_installer;
mod hash_calculator;

use commands::{
  call_wallet,
  close_tapplet,
  get_balances,
  get_free_coins,
  get_permission_token,
  launch_tapplet,
  wallet_daemon,
  download_tapp,
  calculate_tapp_checksum,
  validate_tapp_checksum,
  check_tapp_files,
  extract_tapp_tarball,
};

pub struct Tokens {
  auth: Mutex<String>,
  permission: Mutex<String>,
}
#[derive(Default)]
pub struct ShutdownTokens(Arc<tokio::sync::Mutex<HashMap<String, CancellationToken>>>);

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
    .invoke_handler(
      tauri::generate_handler![
        wallet_daemon,
        get_permission_token,
        get_free_coins,
        get_balances,
        launch_tapplet,
        close_tapplet,
        call_wallet,
        download_tapp,
        calculate_tapp_checksum,
        validate_tapp_checksum,
        check_tapp_files,
        extract_tapp_tarball
      ]
    )
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
