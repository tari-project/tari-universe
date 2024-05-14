use serde::Serialize;

use crate::database::models::InstalledTapplet;

#[derive(Serialize)]
pub struct InstalledTappletWithName {
  pub installed_tapplet: InstalledTapplet,
  pub display_name: String,
}
