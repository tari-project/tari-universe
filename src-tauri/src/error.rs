use std::num::ParseIntError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
  #[error(transparent)] DatabaseError(#[from] DatabaseError),
  #[error(transparent)] IOError(#[from] IOError),
  #[error(transparent)] RequestError(#[from] RequestError),
  #[error(transparent)] TappletServerError(#[from] TappletServerError),
  #[error("Tauri error")] TauriError(#[from] tauri::Error),
  #[error(transparent)] JsonParsingError(#[from] serde_json::Error),
  #[error("Failed to parse tapplet version")] VersionParseError,
  #[error("Failed to find tapplet version")] VersionNotFound,
  #[error("Failed to obtain permission token lock")] FailedToObtainPermissionTokenLock,
  #[error("Failed to obtain auth token lock")] FailedToObtainAuthTokenLock,
  #[error("Provider call failed for method: {method} with params: {params}")] ProviderError {
    method: String,
    params: String,
  },
}

impl serde::Serialize for Error {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: serde::ser::Serializer {
    serializer.serialize_str(self.to_string().as_ref())
  }
}

#[derive(Debug, Error)]
pub enum TappletServerError {
  #[error("Failed to obtain of local address")] FailedToObtainLocalAddress,
  #[error("Failed to start tapplet server")] FailedToStart,
  #[error("Tapplet server already running")] AlreadyRunning,
  #[error("Token for tapplet server is invalid")] TokenInvalid,
  #[error("Failed to bind port: {port}")] BindPortError {
    port: String,
  },
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

#[derive(Debug, Error)]
pub enum IOError {
  #[error("Failed to copy file from {from} to {to}")] FailedToCopyFile {
    from: String,
    to: String,
  },
  #[error("Failed to read directory at path: {path}")] FailedToReadDir {
    path: String,
  },
  #[error("Failed to read file at path: {path}")] FailedToReadFile {
    path: String,
  },
  #[error("Failed to create directory at path: {path}")] FailedToCreateDir {
    path: String,
  },
  #[error("Failed to create file at path: {path}")] FailedToCreateFile {
    path: String,
  },
  #[error("Failed to write file at path: {path}")] FailedToWriteFile {
    path: String,
  },
  #[error("Failed to parse int")] ParseIntError(#[from] ParseIntError),
  #[error("Failed to unpack file at path: {path}")] FailedToUnpackFile {
    path: String,
  },
  #[error("Missing package.json or tapplet.manifest.json from unpacked tapplet at path: {path}")] InvalidUnpackedFiles {
    path: String,
  },
  #[error("Failed to delete tapplet folder at path: {path}")] FailedToDeleteTapplet {
    path: String,
  },
  #[error("Failed to get file path")] FailedToGetFilePath,
}

#[derive(Debug, Error)]
pub enum RequestError {
  #[error("Failed to fetch manifest from {endpoint}")] FetchManifestError {
    endpoint: String,
  },
  #[error("Failed to receive manifest {endpoint}")] ManifestResponseError {
    endpoint: String,
  },
  #[error("Failed to download file from {url}")] FailedToDownload {
    url: String,
  },
}
