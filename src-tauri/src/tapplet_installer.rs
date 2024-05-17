use tauri::Manager;
use tauri_plugin_http::reqwest::{ self };
use std::{ fs, io::Write, path::PathBuf };
use flate2::read::GzDecoder;
use tar::Archive;

use crate::constants::TAPPLETS_INSTALLED_DIR;

pub fn delete_tapplet(tapplet_path: PathBuf) -> Result<(), ()> {
  fs::remove_dir_all(tapplet_path).unwrap();
  Ok(())
}

pub async fn download_file(url: &str, tapplet_path: PathBuf) -> Result<(), anyhow::Error> {
  // Download the file
  let client = reqwest::Client::new();
  let mut response = client
    .get(url)
    .send().await
    .unwrap_or_else(|e| {
      println!("Error making HTTP request: {}", e);
      std::process::exit(1);
    });

  // Ensure the request was successful
  if response.status().is_success() {
    // Extract the file to the tapplet directory
    fs::create_dir_all(&tapplet_path).unwrap();

    // Open a file to write the stream to
    let tapplet_tarball = tapplet_path.join("tapplet.tar.gz");
    let mut file = fs::File::create(tapplet_tarball).unwrap();

    // Stream the response body and write it to the file chunk by chunk
    while let Some(chunk) = response.chunk().await? {
      let _ = file.write_all(&chunk);
    }
  } else if response.status().is_server_error() {
    println!("Download server error! Status: {:?}", response.status());
  } else {
    println!("Download failed. Something else happened. Status: {:?}", response.status());
  }

  Ok(())
}

pub fn extract_tar(tapplet_path: PathBuf) -> Result<(), ()> {
  // Extract the file to the tapplet directory
  let tapplet_tarball = tapplet_path.join("tapplet.tar.gz");
  let tar_gz = fs::File::open(tapplet_tarball).unwrap();
  let tar = GzDecoder::new(tar_gz);
  let mut archive = Archive::new(tar);
  archive.unpack(tapplet_path).unwrap();

  Ok(())
}

pub fn check_extracted_files(tapplet_path: PathBuf) -> Result<bool, String> {
  let package_dir = tapplet_path.join("package");
  let pkg_json_file_path = package_dir.join("package.json");
  let manifest_file_path = package_dir.join("tapplet.manifest.json");

  if pkg_json_file_path.exists() && manifest_file_path.exists() {
    println!("Tapplet files check completed successfully");
    Ok(true)
  } else {
    Err(format!("Extracted tapplet files missing"))
  }
}

pub fn get_tapp_download_path(
  registry_id: String,
  version: String,
  app_handle: tauri::AppHandle
) -> Result<PathBuf, String> {
  // app_path = /home/user/.local/share/universe.tari
  let app_path = app_handle.path().app_data_dir().unwrap().to_path_buf();
  let tapp_dir_path = format!("{}/{}/{}", TAPPLETS_INSTALLED_DIR, registry_id, version);
  let tapplet_path = app_path.join(tapp_dir_path);

  if tapplet_path.exists() {
    Ok(tapplet_path)
  } else {
    Err(format!("Tapplet download path undefined"))
  }
}
