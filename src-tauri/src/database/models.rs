use crate::database::schema::*;
use crate::registry_types::TappletManifest;
use diesel::prelude::*;
use serde::Deserialize;

#[derive(Queryable, Selectable, Debug)]
#[diesel(table_name = installed_tapplet)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct InstalledTapplet {
  pub id: Option<i32>,
  pub tapplet_id: Option<i32>,
  pub is_dev_mode: bool,
  pub dev_mode_endpoint: Option<String>,
  pub path_to_dist: Option<String>,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = installed_tapplet)]
pub struct CreateInstalledTapplet<'a> {
  pub is_dev_mode: bool,
  pub dev_mode_endpoint: &'a str,
  pub path_to_dist: &'a str,
}

#[derive(Debug, AsChangeset)]
#[diesel(table_name = installed_tapplet)]
pub struct UpdateInstalledTapplet {
  pub is_dev_mode: bool,
  pub dev_mode_endpoint: Option<String>,
  pub path_to_dist: Option<String>,
}

#[derive(Queryable, Selectable, Debug)]
#[diesel(table_name = tapplet)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Tapplet {
  pub id: Option<i32>,
  pub registry_id: String,
  pub display_name: String,
  pub author_name: String,
  pub author_website: String,
  pub about_summary: String,
  pub about_description: String,
  pub category: String,
  pub package_name: String,
  pub registry_url: String,
  pub image_id: Option<i32>,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = tapplet)]
pub struct CreateTapplet<'a> {
  pub registry_id: &'a str,
  pub display_name: &'a str,
  pub author_name: &'a str,
  pub author_website: &'a str,
  pub about_summary: &'a str,
  pub about_description: &'a str,
  pub category: &'a str,
  pub package_name: &'a str,
  pub registry_url: &'a str,
  pub image_id: Option<i32>,
}

impl<'a> From<&'a TappletManifest> for CreateTapplet<'a> {
  fn from(tapplet_manifest: &'a TappletManifest) -> Self {
    CreateTapplet {
      registry_id: &tapplet_manifest.id,
      display_name: &tapplet_manifest.metadata.display_name,
      author_name: &tapplet_manifest.metadata.author.name,
      author_website: &tapplet_manifest.metadata.author.website,
      about_summary: &tapplet_manifest.metadata.about.summary,
      about_description: &tapplet_manifest.metadata.about.description,
      category: &tapplet_manifest.metadata.category,
      package_name: &tapplet_manifest.metadata.source.location.npm.package_name,
      registry_url: &tapplet_manifest.metadata.source.location.npm.registry,
      image_id: None,
    }
  }
}

#[derive(Debug, AsChangeset)]
#[diesel(table_name = tapplet)]
pub struct UpdateTapplet {
  pub registry_id: String,
  pub display_name: String,
  pub author_name: String,
  pub author_website: String,
  pub about_summary: String,
  pub about_description: String,
  pub category: String,
  pub package_name: String,
  pub registry_url: String,
  pub image_id: Option<i32>,
}

#[derive(Queryable, Selectable, Debug)]
#[diesel(table_name = asset)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Asset {
  pub id: Option<i32>,
  pub rel_path: String,
}

#[derive(Insertable, Debug)]
#[diesel(table_name = asset)]
pub struct CreateAsset<'a> {
  pub rel_path: &'a str,
}

#[derive(Debug, AsChangeset)]
#[diesel(table_name = asset)]
pub struct UpdateAsset {
  pub rel_path: String,
}

#[derive(Queryable, Selectable, Debug)]
#[diesel(table_name = tapplet_version)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct TappletVersion {
  pub id: Option<i32>,
  pub tapplet_id: Option<i32>,
  pub version: String,
  pub checksum: String,
}

#[derive(Insertable, Debug)]
#[diesel(table_name = tapplet_version)]
pub struct CreateTappletVersion<'a> {
  pub tapplet_id: Option<i32>,
  pub version: &'a str,
  pub checksum: &'a str,
}

#[derive(Debug, AsChangeset)]
#[diesel(table_name = tapplet_version)]
pub struct UpdateTappletVersion {
  pub tapplet_id: Option<i32>,
  pub version: String,
  pub checksum: String,
}
