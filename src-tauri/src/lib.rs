use diesel::SqliteConnection;
use std::{ collections::HashMap, sync::{ Arc, Mutex }, thread::sleep, time::Duration };
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
mod error;
mod constants;

use commands::{
  call_wallet,
  calculate_and_validate_tapp_checksum,
  launch_tapplet,
  close_tapplet,
  download_and_extract_tapp,
  get_balances,
  get_free_coins,
  insert_installed_tapp_db,
  read_installed_tapp_db,
  update_installed_tapp_db,
  delete_installed_tapp_db,
  insert_tapp_registry_db,
  read_tapp_registry_db,
  update_tapp_registry_db,
  fetch_tapplets,
  get_by_id_tapp_registry_db,
  delete_installed_tapp,
  get_registered_tapp_with_version,
  add_dev_tapplet,
  read_dev_tapplets,
  delete_dev_tapplet,
};

use crate::{ rpc::permission_token, wallet_daemon::start_wallet_daemon };

pub struct Tokens {
  auth: Mutex<String>,
  permission: Mutex<String>,
}
#[derive(Default)]
pub struct ShutdownTokens(Arc<tokio::sync::Mutex<HashMap<i32, CancellationToken>>>);
pub struct DatabaseConnection(Arc<Mutex<SqliteConnection>>);

async fn try_get_tokens() -> (String, String) {
  loop {
    match permission_token().await {
      Ok(tokens) => {
        return tokens;
      }
      Err(e) => {
        println!("Failed to get tokens: {}", e);
        sleep(Duration::from_millis(500));
        continue;
      }
    }
  }
}

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
        get_free_coins,
        get_balances,
        launch_tapplet,
        close_tapplet,
        call_wallet,
        insert_installed_tapp_db,
        read_installed_tapp_db,
        update_installed_tapp_db,
        delete_installed_tapp_db,
        insert_tapp_registry_db,
        read_tapp_registry_db,
        update_tapp_registry_db,
        download_and_extract_tapp,
        calculate_and_validate_tapp_checksum,
        fetch_tapplets,
        get_by_id_tapp_registry_db,
        delete_installed_tapp,
        get_registered_tapp_with_version,
        add_dev_tapplet,
        read_dev_tapplets,
        delete_dev_tapplet
      ]
    )
    .setup(|app| {
      let data_dir_path = app.path().app_data_dir().unwrap();
      if !data_dir_path.exists() {
        std::fs::create_dir(&data_dir_path).unwrap();
      }
      let data_dir_path = data_dir_path.to_path_buf();

      let log_path = app.path().app_log_dir().unwrap();
      if !log_path.exists() {
        std::fs::create_dir(&log_path).unwrap();
      }
      let log_path = log_path.to_path_buf();

      tauri::async_runtime::spawn(async move {
        start_wallet_daemon(log_path, data_dir_path).await.unwrap(); // TODO handle error while starting wallet daemon https://github.com/orgs/tari-project/projects/18/views/1?pane=issue&itemId=63753279
      });
      let db_path = app.path().app_data_dir().unwrap().to_path_buf().join(constants::DB_FILE_NAME);
      app.manage(DatabaseConnection(Arc::new(Mutex::new(database::establish_connection(db_path.to_str().unwrap())))));

      let tokens = app.state::<Tokens>();
      let handle = tauri::async_runtime::spawn(try_get_tokens());
      let (permission_token, auth_token) = tauri::async_runtime::block_on(handle).unwrap();
      tokens.permission
        .lock()
        .map_err(|_| error::Error::FailedToObtainPermissionTokenLock())?
        .replace_range(.., &permission_token);
      tokens.auth
        .lock()
        .map_err(|_| error::Error::FailedToObtainAuthTokenLock())?
        .replace_range(.., &auth_token);

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
