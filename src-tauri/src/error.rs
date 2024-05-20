use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
  #[error("Dev tapp with this endpoint already exists")] DevTappletAlreadyExists(),
  #[error("Failed to delete tapplet folder")] CantDeleteTapplet(),
  #[error(transparent)] DatabaseError(diesel::result::Error),
  #[error("Failed to bind port: {port}")] BindPortError {
    port: String,
  },
  #[error("Failed to obtain of local address")] LocalAddressError(),
  #[error("Failed to start tapplet server")] TappletServerError(),
  #[error("Tapplet server already running")] TappletServerAlreadyRunning(),
  #[error("Token for tapplet server is invalid")] TappletServerTokenInvalid(),
  #[error("Tauri error")] TauriError(),
  #[error(transparent)] JsonParsingError(#[from] serde_json::Error),
}

impl serde::Serialize for Error {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: serde::ser::Serializer {
    serializer.serialize_str(self.to_string().as_ref())
  }
}

impl From<diesel::result::Error> for Error {
  fn from(e: diesel::result::Error) -> Self {
    match e {
      diesel::result::Error::DatabaseError(kind, ref _info) =>
        match kind {
          diesel::result::DatabaseErrorKind::UniqueViolation => Error::DevTappletAlreadyExists(),
          _ => Error::DatabaseError(e),
        }
      _ => Error::DatabaseError(e),
    }
  }
}

impl From<tauri::Error> for Error {
  fn from(e: tauri::Error) -> Self {
    match e {
      _ => Error::TauriError(),
    }
  }
}
