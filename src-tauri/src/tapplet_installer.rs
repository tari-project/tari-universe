#[tauri::command]
async fn download_tapplet(url: String, name: String) -> Result<(), ()> {
  let handle = tauri::async_runtime::spawn(async move { download_file(url.clone(), name.clone()).await });
  let _ = handle.await.unwrap();

  Ok(())
}

async fn download_file(url: String, name: String) -> Result<(), anyhow::Error> {
  // Download the file
  let client = Client::new();
  let mut response = client
    .get(url)
    .send().await
    .unwrap_or_else(|e| {
      println!("Error making HTTP request: {}", e);
      std::process::exit(1);
    });

  if response.status().is_success() {
    println!("{} tapplet downloaded successfully!", name);
  } else if response.status().is_server_error() {
    println!("download server error!");
  } else {
    println!("Download failed. Something else happened. Status: {:?}", response.status());
  }

  // Ensure the request was successful
  if response.status().is_success() {
    // Extract the file to the download directory
    let download_dir = tauri::api::path::download_dir().unwrap();
    let app_dir = download_dir.join(PathBuf::from("tari-universe")).join(PathBuf::from(name));
    fs::create_dir_all(&app_dir).unwrap();
    println!("tapplet dir created!");
    // Open a file to write the stream to
    let mut file = File::create(app_dir.join("tapplet.tar.gz")).unwrap();

    // Stream the response body and write it to the file chunk by chunk
    while let Some(chunk) = response.chunk().await? {
      file.write_all(&chunk).unwrap();
    }

    println!("File downloaded successfully.");
  } else {
    eprintln!("Download error: {}", response.status());
  }
  Ok(())
}
