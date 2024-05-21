use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
  #[error(transparent)] DatabaseError(#[from] DatabaseError),
  #[error("Failed to delete tapplet folder")] CantDeleteTapplet(),
  #[error("Failed to bind port: {port}")] BindPortError {
    port: String,
  },
  #[error("Failed to obtain of local address")] LocalAddressError(),
  #[error("Failed to start tapplet server")] TappletServerError(),
  #[error("Tapplet server already running")] TappletServerAlreadyRunning(),
  #[error("Token for tapplet server is invalid")] TappletServerTokenInvalid(),
  #[error("Failed to fetch manifest")] FetchManifestError(),
  #[error("Failed to receive manifest")] ManifestResponseError(),
  #[error("Tauri error")] TauriError(#[from] tauri::Error),
  #[error(transparent)] JsonParsingError(#[from] serde_json::Error),
}

impl serde::Serialize for Error {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: serde::ser::Serializer {
    serializer.serialize_str(self.to_string().as_ref())
  }
}

#[derive(Debug, Error)]
pub enum DatabaseError {
  #[error("{entity_name} with this {field_name} already exists")] AlreadyExists {
    entity_name: String,
    field_name: String,
  },
  #[error("Failed to retrieve {entity_name} data")] FailedToRetrieveData {
    entity_name: String,
  },
  #[error("Failed to delete {entity_name}")] FailedToDelete {
    entity_name: String,
  },
  #[error("Failed to update {entity_name}")] FailedToUpdate {
    entity_name: String,
  },
  #[error("Failed to create {entity_name}")] FailedToCreate {
    entity_name: String,
  },
}
