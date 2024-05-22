use std::{ env, fs, panic, path::PathBuf, process };

use tari_common::initialize_logging;
use tari_crypto::{ keys::PublicKey, ristretto::RistrettoPublicKey };
use tari_dan_app_utilities::configuration::load_configuration;
use tari_dan_wallet_daemon::{ cli::Cli, config::ApplicationConfig, initialize_wallet_sdk, run_tari_dan_wallet_daemon };
use tari_dan_wallet_sdk::apis::key_manager;
use tari_shutdown::Shutdown;

pub async fn start_wallet_daemon() -> Result<(), anyhow::Error> {
  let default_hook = panic::take_hook();
  panic::set_hook(
    Box::new(move |info| {
      default_hook(info);
      process::exit(1);
    })
  );

  let base_path = env::current_dir().unwrap().parent().unwrap().to_path_buf();

  let cli = Cli::init();

  let config_path = PathBuf::from(base_path.join("config.toml"));
  let cfg = load_configuration(config_path, true, &cli).unwrap();
  let mut config = ApplicationConfig::load_from(&cfg).unwrap();
  config.dan_wallet_daemon.indexer_node_json_rpc_url = env::var("INDEXER_NODE_JSON_RPC_URL").unwrap();
  let derive_secret = env::var("DERIVE_SECRET").ok();

  if let Some(secret) = derive_secret {
    let index = secret.parse::<u64>().unwrap();
    let sdk = initialize_wallet_sdk(&config).unwrap();
    let secret = sdk.key_manager_api().derive_key(key_manager::TRANSACTION_BRANCH, index).unwrap();
    println!("Secret: {}", secret.key.reveal());
    println!("Public key: {}", RistrettoPublicKey::from_secret_key(&secret.key));
  }
  // Remove the file if it was left behind by a previous run
  let _file = fs::remove_file(base_path.join("pid"));

  let shutdown = Shutdown::new();
  let shutdown_signal = shutdown.to_signal();

  if let Err(e) = initialize_logging(&base_path.join("log4rs.yml"), &base_path, include_str!("../log4rs_sample.yml")) {
    eprintln!("{}", e);
    return Err(e.into());
  }

  run_tari_dan_wallet_daemon(config, shutdown_signal).await
}
