use std::{ fs, panic, path::PathBuf, process, net::SocketAddr, str::FromStr };

use log::info;
use tari_common::{ configuration::Network };
use tari_dan_app_utilities::configuration::load_configuration;
use tari_dan_wallet_daemon::{ cli::Cli, config::ApplicationConfig, run_tari_dan_wallet_daemon };
use tari_shutdown::Shutdown;
use crate::utils::logging_utils::setup_logging;

const LOG_TARGET: &str = "tari::dan::wallet_daemon::json_rpc";

pub async fn start_wallet_daemon(
  log_dir: PathBuf,
  data_dir_path: PathBuf,
  wallet_daemon_config_file: PathBuf
) -> Result<(), anyhow::Error> {
  let default_hook = panic::take_hook();
  panic::set_hook(
    Box::new(move |info| {
      default_hook(info);
      process::exit(1);
    })
  );
  let wallet_daemon_config_file = wallet_daemon_config_file.to_str().unwrap().to_owned();
  let log_config_file = &log_dir.join("wallet_daemon").join("configs").join("log4rs_config_wallet.yml");
  setup_logging(&log_config_file.clone(), &log_dir.clone(), include_str!("../log4rs/wallet_daemon_sample.yml"))?;

  let mut cli = Cli::init();
  cli.common.network = Some(Network::LocalNet);
  cli.common.base_path = data_dir_path.to_str().unwrap().to_owned();
  cli.common.config = wallet_daemon_config_file.clone();
  cli.common.log_config = Some(log_config_file.clone());

  let cfg = load_configuration(wallet_daemon_config_file, true, &cli).unwrap();
  let mut config = ApplicationConfig::load_from(&cfg).unwrap();
  config.dan_wallet_daemon.indexer_node_json_rpc_url = "http://localhost:18007/json_rpc".to_string();
  config.dan_wallet_daemon.json_rpc_address = SocketAddr::from_str("127.0.0.1:19000").ok(); //TODO: get free port from OS https://github.com/tari-project/tari-universe/issues/70
  config.dan_wallet_daemon.ui_connect_address = Some("0.0.0.0:19000".to_string());

  // Remove the file if it was left behind by a previous run
  let _file = fs::remove_file(data_dir_path.join("pid"));

  let shutdown = Shutdown::new();
  let shutdown_signal = shutdown.to_signal();

  info!(target: LOG_TARGET, "Wallet daemon configuration completed successfully");

  run_tari_dan_wallet_daemon(config, shutdown_signal).await
}
