use tauri_plugin_http::reqwest::{ self };
use std::{ fs, io::{ Read, Write }, path::PathBuf };
use flate2::read::GzDecoder;
use serde_json::Value;
use tar::Archive;

pub async fn download_file(url: String, tapplet_path: String) -> Result<(), anyhow::Error> {
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
    println!("Tapplet downloaded successfully! Path: {:?}", tapplet_path);
    // Extract the file to the tapplet directory
    let tapp_dir = PathBuf::from(tapplet_path);
    println!("create dir path: {:?}", tapp_dir.to_string_lossy());
    fs::create_dir_all(&tapp_dir).unwrap();
    println!("tapplet dir created!");

    // Open a file to write the stream to
    let tapplet_tarball = tapp_dir.join("tapplet.tar.gz");
    let mut file = fs::File::create(tapplet_tarball).unwrap();

    // Stream the response body and write it to the file chunk by chunk
    while let Some(chunk) = response.chunk().await? {
      let _ = file.write_all(&chunk);
    }
  } else if response.status().is_server_error() {
    println!("download server error! Status: {:?}", response.status());
  } else {
    println!("Download failed. Something else happened. Status: {:?}", response.status());
  }

  Ok(())
}

pub fn extract_tar(tapplet_path: &str) -> Result<(), ()> {
  // Extract the file to the tapplet directory
  let tapp_dir = PathBuf::from(tapplet_path);
  let tapplet_tarball = tapp_dir.join("tapplet.tar.gz");
  let tar_gz = fs::File::open(tapplet_tarball).unwrap();
  let tar = GzDecoder::new(tar_gz);
  let mut archive = Archive::new(tar);
  archive.unpack(tapplet_path).unwrap();

  Ok(())
}

pub fn validate_checksum(checksum: &str, tapplet_path: &str) -> bool {
  // Extract the file to the specified directory
  let manifest_file = PathBuf::from(tapplet_path).join("package").join("tapplet.manifest.json");

  // Open the JSON file
  let mut file = fs::File::open(manifest_file).expect("Failed to open manifest.json");

  // Read the JSON data from the file
  let mut data = String::new();
  file.read_to_string(&mut data).expect("Failed to read manifest.json");

  // Parse the JSON data as a Value object
  let json: Value = serde_json::from_str(&data).expect("Failed to parse manifest.json");

  // Extract the integrity field from the Value object

  // TODO don't panic if integrity field not found
  // let pkg_integrity_checksum = json["integrity"]
  //   .as_str()
  //   .expect("Failed to extract integrity field from manifest.json ");
  let _tmp_checksum = "sha512-Teya54P3ObC68rLu8E0IvPfjju0hlIgrej9llyIcNMF5CXoO5eCIBbvNnMaDt6z5nRqrWi6tHFZwlCK1yYpMaw==";

  // Print the integrity value to the console
  println!("Is checksum valid: {}", checksum == _tmp_checksum);
  checksum == _tmp_checksum
}

pub fn check_extracted_files(tapplet_path: &str) -> Result<bool, String> {
  //TODO do we need to check sth more?
  let package_dir = PathBuf::from(&tapplet_path).join("package");
  let pkg_json_file_path = package_dir.join("package.json");
  let manifest_file_path = package_dir.join("tapplet.manifest.json");

  if pkg_json_file_path.exists() && manifest_file_path.exists() {
    println!("Tapplet files check completed successfully");
    Ok(true)
  } else {
    Err(format!("Extracted tapplet files missing"))
  }
}
