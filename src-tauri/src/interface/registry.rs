use std::collections::HashMap;

#[derive(Debug, serde::Deserialize)]
pub struct RegisteredTapplets {
  #[serde(rename = "manifestVersion")]
  pub manifest_version: String,
  #[serde(rename = "registeredTapplets")]
  pub registered_tapplets: HashMap<String, TappletRegistryManifest>,
}

#[derive(Debug, serde::Deserialize)]
pub struct TappletRegistryManifest {
  pub id: String,
  pub metadata: Metadata,
  pub versions: HashMap<String, Version>,
}

#[derive(Debug, serde::Deserialize, Clone)]
pub struct Metadata {
  #[serde(rename = "displayName")]
  pub display_name: String,
  #[serde(rename = "logoUrl")]
  pub logo_url: String,
  #[serde(rename = "backgroundUrl")]
  pub background_url: String,
  pub author: Author,
  pub about: About,
  // pub audits: Vec<Audit>,
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

// Define the TappletManifest struct
#[derive(Debug, serde::Deserialize)]
pub struct TappletManifest {
  #[serde(rename = "packageName")]
  pub package_name: String,
  pub version: String,
  #[serde(rename = "displayName")]
  pub display_name: String,
  pub status: String,
  pub category: String,
  pub author: Author,
  pub about: About,
  pub audits: Vec<Audit>, // Use Vec for arrays in Rust
  pub design: String, // TODO
  pub repository: String, //TODO
  pub source: String, //TODO
  #[serde(rename = "supportedChain")]
  pub supported_chain: Vec<String>,
  pub permissions: Vec<TariPermission>,
  pub manifest_version: String,
}

// Define the enum TariPermission with variants corresponding to the TypeScript types
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub enum TariPermission {
  NftGetOwnershipProof, // TariPermissionNftGetOwnershipProof
  AccountBalance, // TariPermissionAccountBalance
  AccountInfo, // TariPermissionAccountInfo
  AccountList, // TariPermissionAccountList
  KeyList, // TariPermissionKeyList
  TransactionGet, // TariPermissionTransactionGet
  TransactionSend, // TariPermissionTransactionSend
  GetNft, // TariPermissionGetNft
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct LaunchedTappResult {
  pub endpoint: String,
  pub permissions: Vec<TariPermission>,
}
