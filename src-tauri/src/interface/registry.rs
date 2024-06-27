use std::collections::HashMap;

#[derive(Debug, serde::Deserialize)]
pub struct RegisteredTapplets {
  #[serde(rename = "manifestVersion")]
  pub manifest_version: String,
  #[serde(rename = "registeredTapplets")]
  pub registered_tapplets: HashMap<String, TappletManifest>,
}

#[derive(Debug, serde::Deserialize)]
pub struct TappletManifest {
  pub id: String,
  pub metadata: Metadata,
  pub versions: HashMap<String, Version>,
}

#[derive(Debug, serde::Deserialize, Clone)]
pub struct Metadata {
  #[serde(rename = "packageName")]
  pub package_name: String,
  #[serde(rename = "displayName")]
  pub display_name: String,
  #[serde(rename = "logoUrl")]
  pub logo_url: String,
  #[serde(rename = "backgroundUrl")]
  pub background_url: String,
  pub author: Author,
  pub about: About,
  pub audits: Vec<Audit>,
  pub category: String,
}

#[derive(Debug, serde::Deserialize, Clone)]
pub struct Version {
  pub integrity: String,
  #[serde(rename = "registryUrl")]
  pub registry_url: String,
}

#[derive(Debug, serde::Deserialize, Clone)]
pub struct Author {
  pub name: String,
  pub website: String,
}

#[derive(Debug, serde::Deserialize, Clone)]
pub struct About {
  pub summary: String,
  pub description: String,
}

#[derive(Debug, serde::Deserialize, Clone)]
pub struct Audit {
  pub auditor: String,
  #[serde(rename = "reportUrl")]
  pub report_url: String,
}
