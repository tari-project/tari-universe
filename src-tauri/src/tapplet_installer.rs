use tauri::Manager;
use tauri_plugin_http::reqwest::{ self };
use std::{ fs::{ self, File }, io::Write, path::{ Path, PathBuf } };
use flate2::{ read::GzDecoder, write::GzEncoder, Compression };
use tar::{ Archive, Builder };
use crate::{
  constants::{ REGISTRY_URL, TAPPLETS_ASSETS_DIR, TAPPLET_ARCHIVE },
  download_utils::extract,
  error::{ Error::{ self, IOError, JsonParsingError, RequestError }, IOError::*, RequestError::* },
  interface::{ RegisteredTapplets, TappletAssets },
};
use log::{ error, info, warn };
use crate::constants::TAPPLETS_INSTALLED_DIR;
pub const LOG_TARGET: &str = "tari::universe";

pub fn delete_tapplet(tapplet_path: PathBuf) -> Result<(), Error> {
  let path = tapplet_path
    .clone()
    .into_os_string()
    .into_string()
    .map_err(|_| IOError(FailedToGetFilePath))?;
  fs::remove_dir_all(tapplet_path).map_err(|_| IOError(FailedToDeleteTapplet { path }))
}

// pub async fn download_file_and_archive(url: &str, tapplet_path: PathBuf) -> Result<(), Error> {
//   // Download the file
//   let client = reqwest::Client::new();
//   let mut response = client
//     .get(url)
//     .send().await
//     .map_err(|_| RequestError(FailedToDownload { url: url.to_string() }))?;

//   // Ensure the request was successful
//   if response.status().is_success() {
//     // Extract the file to the tapplet directory
//     let path = tapplet_path
//       .clone()
//       .into_os_string()
//       .into_string()
//       .map_err(|_| IOError(FailedToGetFilePath))?;
//     fs::create_dir_all(&tapplet_path).map_err(|_| IOError(FailedToCreateDir { path }))?;

//     // Open a file to write the stream to
//     let tapplet_tarball = tapplet_path.join(TAPPLET_ARCHIVE);
//     let tarball_path = tapplet_tarball
//       .clone()
//       .into_os_string()
//       .into_string()
//       .map_err(|_| IOError(FailedToGetFilePath))?;
//     let mut file = fs::File
//       ::create(tapplet_tarball)
//       .map_err(|_| IOError(FailedToCreateFile { path: tarball_path.clone() }))?;
//     // Stream the response body and write it to the file chunk by chunk
//     while
//       let Some(chunk) = response.chunk().await.map_err(|_| RequestError(FailedToDownload { url: url.to_string() }))?
//     {
//       file.write_all(&chunk).map_err(|_| IOError(FailedToWriteFile { path: tarball_path.clone() }))?;
//     }
//   } else if response.status().is_server_error() {
//     println!("Download server error! Status: {:?}", response.status());
//   } else {
//     println!("Download failed. Something else happened. Status: {:?}", response.status());
//   }

//   Ok(())
// }

// pub fn extract_tar(tapplet_path: PathBuf) -> Result<(), Error> {
//   // Extract the file to the tapplet directory
//   let tapplet_tarball = tapplet_path.join(TAPPLET_ARCHIVE);
//   let path = tapplet_path
//     .clone()
//     .into_os_string()
//     .into_string()
//     .map_err(|_| IOError(FailedToGetFilePath))?;
//   let tar_gz = fs::File::open(tapplet_tarball).map_err(|_| IOError(FailedToReadFile { path: path.clone() }))?;
//   let tar = GzDecoder::new(tar_gz);
//   let mut archive = Archive::new(tar);
//   archive.unpack(tapplet_path).map_err(|_| IOError(FailedToUnpackFile { path }))?;

//   Ok(())
// }

pub fn check_extracted_files(tapplet_path: PathBuf) -> Result<bool, Error> {
  // TODO define all needed files
  let pkg_json_file_path = tapplet_path.join("package").join("package.json");
  let path = tapplet_path
    .into_os_string()
    .into_string()
    .map_err(|_| IOError(FailedToGetFilePath))?;

  if pkg_json_file_path.exists() {
    Ok(true)
  } else {
    Err(IOError(InvalidUnpackedFiles { path }))
  }
}

pub fn get_tapp_download_path(
  registry_id: String,
  version: String,
  app_handle: tauri::AppHandle
) -> Result<PathBuf, Error> {
  // app_path = /home/user/.local/share/universe.tari
  let app_path = app_handle
    .path()
    .app_data_dir()
    .unwrap_or_else(|e| {
      error!(target: LOG_TARGET, "Failed to get app dir: {}", e);
      PathBuf::from("")
    })
    .to_path_buf();
  let tapplet_path = app_path.join(TAPPLETS_INSTALLED_DIR).join(registry_id).join(version);

  Ok(tapplet_path)
}

async fn download_file(url: &str, dest: PathBuf) -> Result<(), Error> {
  let client = reqwest::Client::new();
  let mut response = client
    .get(url)
    .send().await
    .map_err(|_| RequestError(FailedToDownload { url: url.to_string() }))?;

  if response.status().is_success() {
    let dest_parent = dest.parent().unwrap();
    let path = dest
      .clone()
      .into_os_string()
      .into_string()
      .map_err(|_| IOError(FailedToGetFilePath))?;
    fs
      ::create_dir_all(&dest_parent)
      .map_err(|_| IOError(FailedToCreateDir { path: dest_parent.to_str().unwrap().to_owned() }))?;

    let mut file = fs::File::create(dest).map_err(|_| IOError(FailedToCreateFile { path: path.clone() }))?;

    while
      let Some(chunk) = response.chunk().await.map_err(|_| RequestError(FailedToDownload { url: url.to_string() }))?
    {
      file.write_all(&chunk).map_err(|_| IOError(FailedToWriteFile { path: path.clone() }))?;
    }
  } else if response.status().is_server_error() {
    println!("Download server error! Status: {:?}", response.status());
  } else {
    println!("Download failed. Something else happened. Status: {:?}", response);
  }

  Ok(())
}

fn get_or_create_tapp_asset_dir(tapp_root_dir: PathBuf, tapplet_name: &str) -> Result<PathBuf, Error> {
  let tapp_asset_dir = tapp_root_dir.join(TAPPLETS_ASSETS_DIR).join(tapplet_name);
  let path = tapp_asset_dir
    .clone()
    .into_os_string()
    .into_string()
    .map_err(|_| IOError(FailedToGetFilePath))?;
  fs::create_dir_all(path.clone()).map_err(|_| IOError(FailedToCreateDir { path }))?;
  return Ok(tapp_asset_dir);
}

pub async fn download_asset(app_handle: tauri::AppHandle, tapplet_name: String) -> Result<TappletAssets, Error> {
  let tapp_root_dir: PathBuf = app_handle.path().app_data_dir().unwrap().to_path_buf();
  let tapp_asset_dir = get_or_create_tapp_asset_dir(tapp_root_dir, &tapplet_name)?;
  let assets = get_asset_urls(tapplet_name)?;

  let icon_dest = tapp_asset_dir.join("logo.svg");
  let background_dest = tapp_asset_dir.join("background.svg");

  download_file(&assets.icon_url, icon_dest.clone()).await?;
  download_file(&assets.background_url, background_dest.clone()).await?;

  Ok(TappletAssets {
    icon_url: icon_dest.into_os_string().into_string().unwrap(),
    background_url: background_dest.into_os_string().into_string().unwrap(),
  })
}

pub fn get_asset_urls(tapplet_name: String) -> Result<TappletAssets, Error> {
  let icon = format!("{}/src/{}/images/logo.svg", REGISTRY_URL, tapplet_name);
  let background = format!("{}/src/{}/images/background.svg", REGISTRY_URL, tapplet_name);
  Ok(TappletAssets { icon_url: icon, background_url: background })
}

pub async fn fetch_tapp_registry_manifest() -> Result<RegisteredTapplets, Error> {
  let manifest_endpoint = format!("{}/dist/tapplets-registry.manifest.json", REGISTRY_URL);

  let manifest_res = reqwest
    ::get(&manifest_endpoint).await
    .map_err(|_| RequestError(FetchManifestError { endpoint: manifest_endpoint.clone() }))?
    .text().await
    .map_err(|_| RequestError(ManifestResponseError { endpoint: manifest_endpoint.clone() }))?;

  let tapplets: RegisteredTapplets = serde_json::from_str(&manifest_res).map_err(|e| JsonParsingError(e))?;
  Ok(tapplets)
}