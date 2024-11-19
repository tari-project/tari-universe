use constants::TAPPLETS_ASSETS_DIR;
use diesel::SqliteConnection;
use fs::{ get_config_file, get_data_dir, get_log_dir };
use log4rs::config::RawConfig;
use log::{ info, warn };
use tapplet_server::{ setup_log, start };
use utils::logging_utils::setup_logging;
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
mod fs;
mod download_utils;
mod progress_tracker;
mod utils;

use commands::{
  call_wallet,
  launch_tapplet,
  close_tapplet,
  get_assets_server_addr,
  download_and_extract_tapp,
  get_balances,
  get_free_coins,
  insert_installed_tapp_db,
  read_installed_tapp_db,
  update_installed_tapp_db,
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
  update_tapp,
  create_account,
  open_log_dir,
};

use crate::{ rpc::permission_token, wallet_daemon::start_wallet_daemon };

const LOG_TARGET: &str = "tari::universe::main";
pub struct Tokens {
  auth: Mutex<String>,
  permission: Mutex<String>,
}
#[derive(Default)]
pub struct ShutdownTokens(Arc<tokio::sync::Mutex<HashMap<i32, CancellationToken>>>);
pub struct DatabaseConnection(Arc<Mutex<SqliteConnection>>);
pub struct AssetServer {
  pub addr: String,
  pub cancel_token: CancellationToken,
}

async fn try_get_tokens() -> (String, String) {
  loop {
    match permission_token().await {
      Ok(tokens) => {
        info!(target: LOG_TARGET, "WALLET DAEMON permission token ok {:?}", tokens);
        return tokens;
      }
      Err(e) => {
        warn!(target: LOG_TARGET, "❌ WALLET DAEMON permission token error{:?}", e);
        sleep(Duration::from_millis(500));
        continue;
      }
    }
  }
}

fn setup_tari_universe(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
  let data_dir_path = get_data_dir(app)?;
  let log_path = get_log_dir(app)?;
  let log_tapp_dir = log_path.clone();
  let wallet_daemon_config_file = get_config_file(app, "wallet_daemon.config.toml")?;

  // setup universe logging
  let log_config_file = &log_path.join("universe").join("configs").join("log4rs_config_universe.yml");
  let contents = setup_logging(&log_config_file, &log_path, include_str!("../log4rs/universe_sample.yml"))?;
  let config: RawConfig = serde_yaml
    ::from_str(&contents)
    .expect("Could not parse the contents of the log file as yaml");
  // global logger init
  log4rs::init_raw_config(config).expect("Could not initialize logging");

  tauri::async_runtime::spawn(async move {
    start_wallet_daemon(log_path, data_dir_path, wallet_daemon_config_file).await.unwrap();
  });
  let db_path = app.path().app_data_dir()?.to_path_buf().join(constants::DB_FILE_NAME);
  app.manage(DatabaseConnection(Arc::new(Mutex::new(database::establish_connection(db_path.to_str().unwrap())))));

  let tokens = app.state::<Tokens>();
  let handle = tauri::async_runtime::spawn(try_get_tokens());
  let (permission_token, auth_token) = tauri::async_runtime::block_on(handle)?;
  info!(target: LOG_TARGET, "permission token found {:?}", permission_token);
  tokens.permission
    .lock()
    .map_err(|_| error::Error::FailedToObtainPermissionTokenLock)?
    .replace_range(.., &permission_token);
  tokens.auth
    .lock()
    .map_err(|_| error::Error::FailedToObtainAuthTokenLock)?
    .replace_range(.., &auth_token);

  let app_path = app.path().app_data_dir().unwrap().to_path_buf();
  let tapplet_assets_path = app_path.join(TAPPLETS_ASSETS_DIR);
  let _handle_setup_log = tauri::async_runtime::spawn(async move { setup_log(log_tapp_dir).await });
  let handle_start = tauri::async_runtime::spawn(async move { start(tapplet_assets_path).await });
  let (addr, cancel_token) = tauri::async_runtime::block_on(handle_start)?.unwrap();
  app.manage(AssetServer { addr, cancel_token });
  info!(target: LOG_TARGET, "Tari Universe setup completed successfully");

  Ok(())
}

fn display_error_window(app_handle: &mut tauri::App, error_msg: String) {
  let main_window = app_handle.get_window("main").unwrap();
  main_window.close().unwrap();

  let error_window = app_handle.get_webview_window("error").unwrap();
  error_window.show().unwrap();
  error_window.eval(&format!("window.setupErrorMessage='{}'", error_msg)).unwrap();
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
        get_assets_server_addr,
        call_wallet,
        insert_installed_tapp_db,
        read_installed_tapp_db,
        update_installed_tapp_db,
        insert_tapp_registry_db,
        read_tapp_registry_db,
        update_tapp_registry_db,
        download_and_extract_tapp,
        fetch_tapplets,
        get_by_id_tapp_registry_db,
        delete_installed_tapp,
        get_registered_tapp_with_version,
        add_dev_tapplet,
        read_dev_tapplets,
        delete_dev_tapplet,
        update_tapp,
        create_account,
        open_log_dir
      ]
    )
    .setup(|app| {
      match setup_tari_universe(app) {
        Ok(_) => app.get_window("error").unwrap().close().unwrap(),
        Err(e) => display_error_window(app, e.to_string()),
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
