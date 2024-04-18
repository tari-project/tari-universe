# Setup

In a local `tari-dan` repo change swap these dependencies to a version that compiles wallet-daemon:

```toml
# external minotari/tari dependencies
tari_hash_domains = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
minotari_app_grpc = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
minotari_app_utilities = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
minotari_console_wallet = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
minotari_node = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
minotari_node_grpc_client = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
minotari_wallet = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
minotari_wallet_grpc_client = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
tari_common = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
tari_common_types = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }

# avoid including default features so each crate can choose which ones to import
tari_core = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06", default-features = false }
tari_crypto = "0.20.0"
tari_key_manager = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
tari_metrics = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
tari_mmr = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
tari_p2p = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
tari_shutdown = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
tari_storage = { git = "https://github.com/tari-project/tari.git", rev = "284cabfe92e31d1de963f701dd1c404a85cb7a06" }
tari_utilities = "0.7.0"
```

Start `tari-dan` docker image like: `docker run -p 18000-18100:18000-18100 quay.io/tarilabs/dan-testing`

run `cargo tauri dev`

Logs are available in `log/wallet-daemon` folder and sqlite db is in `localnet/data`

Change path for `"@tariproject/wallet_jrpc_client"` in `package.json` file

The example tapplet comes from [tapplet-example](https://github.com/MCozhusheck/tapplet-example)
You can replace viewed by building project and copying the files inside `dist` folder.
