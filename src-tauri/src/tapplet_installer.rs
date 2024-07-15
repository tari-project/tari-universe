use tauri::Manager;
use tauri_plugin_http::reqwest::{ self };
use std::{ fs, io::Write, path::PathBuf };
use flate2::read::GzDecoder;
use tar::Archive;
use crate::error::{ Error::{ self, IOError, RequestError }, IOError::*, RequestError::* };

use crate::constants::TAPPLETS_INSTALLED_DIR;

pub fn delete_tapplet(tapplet_path: PathBuf) -> Result<(), Error> {
  let path = tapplet_path
    .clone()
    .into_os_string()
    .into_string()
    .map_err(|_| IOError(FailedToGetFilePath))?;
  fs::remove_dir_all(tapplet_path).map_err(|_| IOError(FailedToDeleteTapplet { path }))
}

pub async fn download_file(url: &str, tapplet_path: PathBuf) -> Result<(), anyhow::Error> {
  // Download the file
  let client = reqwest::Client::new();
  let mut response = client
    .get(url)
    .send().await
    .map_err(|_| RequestError(FailedToDownload { url: url.to_string() }))?;

  // Ensure the request was successful
  if response.status().is_success() {
    // Extract the file to the tapplet directory
    let path = tapplet_path
      .clone()
      .into_os_string()
      .into_string()
      .map_err(|_| IOError(FailedToGetFilePath))?;
    fs::create_dir_all(&tapplet_path).map_err(|_| IOError(FailedToCreateDir { path }))?;

    // Open a file to write the stream to
    let tapplet_tarball = tapplet_path.join("tapplet.tar.gz");
    let tarball_path = tapplet_tarball
      .clone()
      .into_os_string()
      .into_string()
      .map_err(|_| IOError(FailedToGetFilePath))?;
    let mut file = fs::File
      ::create(tapplet_tarball)
      .map_err(|_| IOError(FailedToCreateFile { path: tarball_path.clone() }))?;
    // Stream the response body and write it to the file chunk by chunk
    while
      let Some(chunk) = response.chunk().await.map_err(|_| RequestError(FailedToDownload { url: url.to_string() }))?
    {
      file.write_all(&chunk).map_err(|_| IOError(FailedToWriteFile { path: tarball_path.clone() }))?;
    }
  } else if response.status().is_server_error() {
    println!("Download server error! Status: {:?}", response.status());
  } else {
    println!("Download failed. Something else happened. Status: {:?}", response.status());
  }

  Ok(())
}

pub fn extract_tar(tapplet_path: PathBuf) -> Result<(), Error> {
  // Extract the file to the tapplet directory
  let tapplet_tarball = tapplet_path.join("tapplet.tar.gz");
  let path = tapplet_path
    .clone()
    .into_os_string()
    .into_string()
    .map_err(|_| IOError(FailedToGetFilePath))?;
  let tar_gz = fs::File::open(tapplet_tarball).map_err(|_| IOError(FailedToReadFile { path: path.clone() }))?;
  let tar = GzDecoder::new(tar_gz);
  let mut archive = Archive::new(tar);
  archive.unpack(tapplet_path).map_err(|_| IOError(FailedToUnpackFile { path }))?;

  Ok(())
}

pub fn check_extracted_files(tapplet_path: PathBuf) -> Result<bool, Error> {
  let package_dir = tapplet_path.join("package");
  let pkg_json_file_path = package_dir.join("package.json");
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
) -> Result<PathBuf, ()> {
  // app_path = /home/user/.local/share/universe.tari
  let app_path = app_handle.path().app_data_dir().unwrap().to_path_buf();
  let tapp_dir_path = format!("{}/{}/{}", TAPPLETS_INSTALLED_DIR, registry_id, version);
  let tapplet_path = app_path.join(tapp_dir_path);

  Ok(tapplet_path)
}
