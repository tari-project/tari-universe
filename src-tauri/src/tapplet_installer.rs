use tauri_plugin_http::reqwest::{ self };
use std::{ fs, io::{ Read, Write }, path::PathBuf, process::{ Command, Stdio } };
use flate2::read::GzDecoder;
use tar::Archive;
use serde_json::Value;

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

  if response.status().is_success() {
    println!("Tapplet downloaded successfully! Path: {:?}", tapplet_path);
  } else if response.status().is_server_error() {
    println!("download server error!");
  } else {
    println!("Download failed. Something else happened. Status: {:?}", response.status());
  }

  // Ensure the request was successful
  if response.status().is_success() {
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

    println!("File downloaded successfully.");
  } else {
    eprintln!("Download error: {}", response.status());
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

pub fn calculate_shasum(path: &str) -> Result<String, String> {
  // command to calculate shasum 512
  // shasum -b -a 512 /path/tapplet.tar.gz | awk '{ print $1 }' | xxd -r -p | base64
  let tarball_file = format!("{}{}", path, "/tapplet.tar.gz");
  let mut shasum_command = Command::new("shasum");
  println!("{}", tarball_file);
  shasum_command.arg("-b").arg("-a").arg("512").arg(tarball_file);

  let mut awk_command = Command::new("awk");
  awk_command.arg("{ print $1 }");

  let mut xxd_command = Command::new("xxd");
  xxd_command.arg("-r").arg("-p");

  let mut base64_command = Command::new("base64");

  let shasum_output = shasum_command.stdout(Stdio::piped()).spawn().expect("failed to spawn shasum command");
  let awk_output = awk_command
    .stdin(shasum_output.stdout.unwrap())
    .stdout(Stdio::piped())
    .spawn()
    .expect("failed to spawn awk command");
  let xxd_output = xxd_command
    .stdin(awk_output.stdout.unwrap())
    .stdout(Stdio::piped())
    .spawn()
    .expect("failed to spawn xxd command");
  let base64_output = base64_command
    .stdin(xxd_output.stdout.unwrap())
    .output()
    .expect("failed to spawn base64 command");

  // format output to match `integrity` field from manifest.json
  let formatted_shasum = format!("{}{}", "sha512-", String::from_utf8_lossy(&base64_output.stdout).replace("\n", ""));
  println!("new way cal -> {}", formatted_shasum);
  Ok(formatted_shasum)
}

pub fn validate_checksum(checksum: &str, tapplet_path: &str) -> bool {
  println!("validate_checksum path: {}", tapplet_path);
  // // Extract the file to the specified directory
  // let download_dir = tauri::api::path::download_dir().unwrap();
  let manifest_file = PathBuf::from(tapplet_path).join("package").join("tapplet.manifest.json");

  // Open the JSON file
  let mut file = fs::File::open(manifest_file).expect("Failed to open manifest.json");

  // Read the JSON data from the file
  let mut data = String::new();
  file.read_to_string(&mut data).expect("Failed to read manifest.json");

  // Parse the JSON data as a Value object
  let json: Value = serde_json::from_str(&data).expect("Failed to parse manifest.json");

  // Extract the integrity field from the Value object
  let pkg_integrity_checksum = json["integrity"].as_str().expect("Failed to extract integrity");

  // Print the integrity value to the console
  println!("pkg_integrity_checksum: {}", pkg_integrity_checksum);
  println!("checksum: {}", checksum);
  println!("are equal? {}", checksum == pkg_integrity_checksum);
  checksum == pkg_integrity_checksum
}

pub fn check_extracted_files(tapplet_path: &str) -> Result<bool, String> {
  let package_dir = PathBuf::from(&tapplet_path).join("package");
  let pkg_json_file_path = package_dir.join("package.json");
  // TODO check manifest
  // let manifest_file_path = package_dir.join("tapplet.manifest.json");

  println!("check files {}", tapplet_path);
  if pkg_json_file_path.exists() {
    println!("files gitowa");
    Ok(true)
  } else {
    Err(format!("Extracted tapplet files missing"))
  }
}
