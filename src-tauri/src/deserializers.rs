use std::collections::HashMap;

#[derive(Debug, serde::Deserialize)]
pub struct VerifiedTapplets {
  #[serde(rename = "verifiedTapplets")]
  pub verified_tapplets: HashMap<String, TappletManifest>,
}

#[derive(Debug, serde::Deserialize)]
pub struct TappletManifest {
  pub id: String,
  pub metadata: Metadata,
  pub versions: HashMap<String, Version>,
}

#[derive(Debug, serde::Deserialize)]
pub struct Metadata {
  #[serde(rename = "displayName")]
  pub display_name: String,
  pub author: Author,
  pub about: About,
  pub audits: Vec<Audit>,
  pub category: String,
  pub source: Source,
}

#[derive(Debug, serde::Deserialize)]
pub struct Version {
  pub checksum: String,
}

#[derive(Debug, serde::Deserialize)]
pub struct Author {
  pub name: String,
  pub website: String,
}

#[derive(Debug, serde::Deserialize)]
pub struct About {
  pub summary: String,
  pub description: String,
}

#[derive(Debug, serde::Deserialize)]
pub struct Audit {
  pub auditor: String,
  pub report: String,
}

#[derive(Debug, serde::Deserialize)]
pub struct Source {
  pub location: Location,
}

#[derive(Debug, serde::Deserialize)]
pub enum Location {
  #[serde(rename = "npm")] Npm {
    #[serde(rename = "packageName")]
    package_name: String,
    registry: String,
  },
  #[serde(rename = "cargo")] Cargo {
    #[serde(rename = "packageName")]
    package_name: String,
    registry: String,
  },
}
