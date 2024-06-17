use std::{ path::PathBuf, fs::{ create_dir, copy } };
use tauri::{ self, App, Manager };

use crate::error::{ Error::{ self, IOError }, IOError::* };

pub fn get_log_dir(app: &mut App) -> Result<PathBuf, Error> {
  let log_dir = app.path().app_log_dir()?;
  if !log_dir.exists() {
    create_dir(&log_dir).map_err(|_| IOError(FailedToCreateDir { path: log_dir.to_str().unwrap().to_string() }))?;
  }
  Ok(log_dir.to_path_buf())
}

pub fn get_data_dir(app: &mut App) -> Result<PathBuf, Error> {
  let data_dir = app.path().app_data_dir()?;
  if !data_dir.exists() {
    create_dir(&data_dir).map_err(|_| IOError(FailedToCreateDir { path: data_dir.to_str().unwrap().to_string() }))?;
  }
  Ok(data_dir.to_path_buf())
}

pub fn get_config_file(app: &mut App, file_name: &str) -> Result<PathBuf, Error> {
  let bundled_resource_file = app.path().resolve(file_name, tauri::path::BaseDirectory::Resource)?;
  let user_config_file = app.path().app_config_dir()?.to_path_buf().join(file_name);

  if user_config_file.exists() {
    Ok(user_config_file)
  } else {
    if !app.path().app_config_dir()?.to_path_buf().exists() {
      create_dir(app.path().app_config_dir()?.to_path_buf()).map_err(|_|
        IOError(FailedToCreateDir { path: app.path().app_config_dir().unwrap().to_str().unwrap().to_string() })
      )?;
    }
    copy(bundled_resource_file.clone(), &user_config_file).map_err(|_|
      IOError(FailedToCopyFile {
        from: bundled_resource_file.to_str().unwrap().to_string(),
        to: user_config_file.to_str().unwrap().to_string(),
      })
    )?;
    Ok(user_config_file)
  }
}
