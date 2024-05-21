use tauri_plugin_http::reqwest::{ self };
use std::{ fs, io::Write, path::PathBuf };
use flate2::read::GzDecoder;
use tar::Archive;
use crate::error::{ Error, IOError::* };

pub fn delete_tapplet(tapplet_path: &str) -> Result<(), Error> {
  let tapp_dir = PathBuf::from(tapplet_path);
  fs::remove_dir_all(tapp_dir).map_err(|_| Error::from(FailedToDeleteTapplet { path: tapplet_path.to_string() }))
}

pub async fn download_file(url: &str, tapplet_path: &str) -> Result<(), anyhow::Error> {
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
    let tapp_dir = PathBuf::from(tapplet_path);
    fs::create_dir_all(&tapp_dir).map_err(|_| Error::from(FailedToCreateDir { path: tapplet_path.to_string() }))?;

    // Open a file to write the stream to
    let tapplet_tarball = tapp_dir.join("tapplet.tar.gz");
    let mut file = fs::File
      ::create(tapplet_tarball)
      .map_err(|_| Error::from(FailedToCreateFile { path: tapplet_path.to_string() }))?;

    // Stream the response body and write it to the file chunk by chunk
    while let Some(chunk) = response.chunk().await? {
      file.write_all(&chunk)?;
    }
  } else if response.status().is_server_error() {
    println!("Download server error! Status: {:?}", response.status());
  } else {
    println!("Download failed. Something else happened. Status: {:?}", response.status());
  }

  Ok(())
}

pub fn extract_tar(tapplet_path: &str) -> Result<(), Error> {
  // Extract the file to the tapplet directory
  let tapp_dir = PathBuf::from(tapplet_path);
  let tapplet_tarball = tapp_dir.join("tapplet.tar.gz");
  let tar_gz = fs::File
    ::open(tapplet_tarball)
    .map_err(|_| Error::from(FailedToReadFile { path: tapplet_path.to_string() }))?;
  let tar = GzDecoder::new(tar_gz);
  let mut archive = Archive::new(tar);
  archive.unpack(tapplet_path).map_err(|_| Error::from(FailedToUnpackFile { path: tapplet_path.to_string() }))?;

  Ok(())
}

pub fn check_extracted_files(tapplet_path: &str) -> Result<bool, Error> {
  let package_dir = PathBuf::from(&tapplet_path).join("package");
  let pkg_json_file_path = package_dir.join("package.json");
  let manifest_file_path = package_dir.join("tapplet.manifest.json");

  if pkg_json_file_path.exists() && manifest_file_path.exists() {
    Ok(true)
  } else {
    Err(Error::from(InvalidUnpackedFiles { path: tapplet_path.to_string() }))
  }
}
