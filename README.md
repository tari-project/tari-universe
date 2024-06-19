# Requirements
Install `tauri-cli` with command `cargo install tauri-cli --version "^2.0.0-beta"`
Install `npm` and `node` from [npm docs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
Minimal requirements are:
 - node version >= 18
 - npm version >= 8

Install [rust](https://www.rust-lang.org/tools/install) with minimal version 1.77

Add wasm32-unknown-unknown compilation target for rust with command `rustup target add wasm32-unknown-unknown`

tari-dan requires it's own dependencies to run on ubuntu:

Run [install_ubuntu_dependencies.sh](https://github.com/tari-project/tari-dan/blob/development/scripts/install_ubuntu_dependencies.sh) from tari-dan repo

## windows
Download Visual Studio Community 2019 from [microsoft webpage](https://learn.microsoft.com/en-us/visualstudio/releases/2019/redistribution#--download)
On installation select `Dekstop development with C++` from `Desktop & Mobile` tab and click `Install`.


# Running Tari Universe locally

Run `cargo tauri dev` to launch application locally

Logs and databases are in the app system directory 
- linux `/home/$USER/.local/share/universe.tari`
- macOS `$HOME/Library/Application Support`
- windows `{FOLDERID_RoamingAppData}`

# Testing tapplets locally

Navigate to `Tapplet Registry` and click `Add dev tapplet` to add tapplet running on your machine
