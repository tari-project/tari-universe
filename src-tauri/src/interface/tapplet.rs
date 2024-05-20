use serde::Serialize;

use crate::database::models::{ InstalledTapplet, Tapplet, TappletVersion };

#[derive(Serialize)]
pub struct InstalledTappletWithName {
  pub installed_tapplet: InstalledTapplet,
  pub display_name: String,
}

#[derive(Serialize)]
pub struct RegisteredTappletWithVersion {
  pub registered_tapp: Tapplet,
  pub tapp_version: TappletVersion,
}
