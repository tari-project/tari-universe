use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
  #[error(transparent)] Io(#[from] std::io::Error),

  #[error(transparent)] DatabaseError(#[from] diesel::result::Error),
  #[error(transparent)] JsonParsingError(#[from] serde_json::Error),
}

impl serde::Serialize for Error {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: serde::ser::Serializer {
    serializer.serialize_str(self.to_string().as_ref())
  }
}
