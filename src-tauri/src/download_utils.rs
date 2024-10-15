use anyhow::{ anyhow, Error };
use async_zip::base::read::seek::ZipFileReader;
use flate2::read::GzDecoder;
use futures_util::StreamExt;
use log::info;
use tauri_plugin_http::reqwest;
use std::path::{ Path, PathBuf };
use std::time::Duration;
use tar::Archive;
use tokio::fs;
use tokio::fs::{ File, OpenOptions };
use tokio::io::{ AsyncWriteExt, BufReader };
use tokio::time::sleep;
use tokio_util::compat::{ TokioAsyncReadCompatExt, TokioAsyncWriteCompatExt };

use crate::progress_tracker::ProgressTracker;

const LOG_TARGET: &str = "tari::universe::download_utils";

pub async fn download_file_with_retries(
  url: &str,
  destination: &Path,
  progress_tracker: ProgressTracker
) -> Result<(), Error> {
  let mut retries = 0;
  loop {
    match download_file(url, destination, progress_tracker.clone()).await {
      Ok(_) => {
        return Ok(());
      }
      Err(err) => {
        if retries >= 3 {
          return Err(err);
        }
        retries += 1;
        eprintln!("Error downloading file: {}. Try {:?}/3", err, retries);
        sleep(Duration::from_secs(1)).await;
      }
    }
  }
}

async fn download_file(url: &str, destination: &Path, progress_tracker: ProgressTracker) -> Result<(), anyhow::Error> {
  let response = reqwest::get(url).await?;

  // Ensure the directory exists
  if let Some(parent) = destination.parent() {
    fs::create_dir_all(parent).await?;
  }
  // Open a file for writing
  let mut dest = File::create(destination).await?;

  // Stream the response body directly to the file
  let mut stream = response.bytes_stream();
  while let Some(item) = stream.next().await {
    let _ = progress_tracker.update("downloading".to_string(), None, 10).await;
    dest.write_all(&item?).await?;
  }
  progress_tracker.update("download-completed".to_string(), None, 100).await;
  info!(target: LOG_TARGET, "Finished downloading: {}", url);
  Ok(())
}

pub async fn extract(file_path: &Path, dest_dir: &Path) -> Result<(), anyhow::Error> {
  match file_path.extension() {
    Some(ext) =>
      match ext.to_str() {
        Some("gz") => {
          extract_gz(file_path, dest_dir).await?;
        }
        Some("zip") => {
          extract_zip(file_path, dest_dir).await?;
        }
        _ => {
          return Err(anyhow::anyhow!("Unsupported file extension"));
        }
      }
    None => {
      return Err(anyhow::anyhow!("File has no extension"));
    }
  }
  Ok(())
}

pub async fn extract_gz(gz_path: &Path, dest_dir: &Path) -> std::io::Result<()> {
  let gz_file = std::fs::File::open(gz_path)?;
  let decoder = GzDecoder::new(std::io::BufReader::new(gz_file));
  let mut archive = Archive::new(decoder);
  archive.unpack(dest_dir)?;
  Ok(())
}

fn sanitize_file_path(path: &str) -> PathBuf {
  // Replaces backwards slashes
  path
    .replace('\\', "/")
    // Sanitizes each component
    .split('/')
    .map(sanitize_filename::sanitize)
    .collect()
}
pub async fn extract_zip(archive: &Path, out_dir: &Path) -> Result<(), anyhow::Error> {
  let archive = BufReader::new(fs::File::open(archive).await?).compat();
  let mut reader = ZipFileReader::new(archive).await?;
  for index in 0..reader.file().entries().len() {
    let entry = reader
      .file()
      .entries()
      .get(index)
      .ok_or_else(|| { anyhow!("The entry at index {} does not exist. The archive may be corrupted.", index) })?;

    let path = entry
      .filename()
      .as_str()
      .map(|entry| out_dir.join(sanitize_file_path(entry)))
      .map_err(|error| { anyhow!("The entry at index {} has an invalid filename: {}", index, error) })?;

    // If the filename of the entry ends with '/', it is treated as a directory.
    // This is implemented by previous versions of this crate and the Python Standard Library.
    // https://docs.rs/async_zip/0.0.8/src/async_zip/read/mod.rs.html#63-65
    // https://github.com/python/cpython/blob/820ef62833bd2d84a141adedd9a05998595d6b6d/Lib/zipfile.py#L528
    let entry_is_dir = entry
      .dir()
      .map_err(|error| { anyhow!("The entry at index {} has an invalid directory flag: {}", index, error) })?;

    let mut entry_reader = reader.reader_without_entry(index).await?;

    if entry_is_dir {
      // The directory may have been created if iteration is out of order.
      if !path.exists() {
        fs::create_dir_all(&path).await?;
      }
    } else {
      // Creates parent directories. They may not exist if iteration is out of order
      // or the archive does not contain directory entries.
      let parent = path.parent().ok_or_else(|| anyhow!("no parent"))?;
      if !parent.is_dir() {
        fs::create_dir_all(parent).await?;
      }
      let writer = OpenOptions::new().write(true).create_new(true).open(&path).await?;
      futures_lite::io::copy(&mut entry_reader, &mut writer.compat_write()).await?;

      // Closes the file and manipulates its metadata here if you wish to preserve its metadata from the archive.
    }
  }
  Ok(())
}
