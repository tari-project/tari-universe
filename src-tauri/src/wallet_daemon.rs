use std::{ fs, panic, path::PathBuf, process, net::SocketAddr, str::FromStr };

use tari_common::{ initialize_logging, configuration::Network };
use tari_dan_app_utilities::configuration::load_configuration;
use tari_dan_wallet_daemon::{ cli::Cli, config::ApplicationConfig, run_tari_dan_wallet_daemon };
use tari_shutdown::Shutdown;

pub async fn start_wallet_daemon(
  log_path: PathBuf,
  data_dir_path: PathBuf,
  wallet_daemon_config_file: PathBuf,
  log_config_file: PathBuf
) -> Result<(), anyhow::Error> {
  let default_hook = panic::take_hook();
  panic::set_hook(
    Box::new(move |info| {
      default_hook(info);
      process::exit(1);
    })
  );
  let wallet_daemon_config_file = wallet_daemon_config_file.to_str().unwrap().to_owned();

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

  if let Err(e) = initialize_logging(&log_config_file, &log_path, include_str!("../log4rs_sample.yml")) {
    eprintln!("{}", e);
    return Err(e.into());
  }

  run_tari_dan_wallet_daemon(config, shutdown_signal).await
}
