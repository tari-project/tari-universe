use serde::Serialize;

use crate::database::models::{ InstalledTapplet, Tapplet, TappletVersion };

#[derive(Serialize)]
pub struct InstalledTappletWithName {
  pub installed_tapplet: InstalledTapplet,
  pub display_name: String,
}

#[derive(Serialize)]
pub struct RegistedTappletWithVersion {
  pub registered_tapplet: Tapplet,
  pub version: String,
  pub integrity: String,
  pub registry_url: String,
}
