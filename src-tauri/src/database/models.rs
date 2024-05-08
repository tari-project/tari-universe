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
pub struct CreateInstalledTapplet {
  pub is_dev_mode: bool,
  pub dev_mode_endpoint: String,
  pub path_to_dist: String,
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
pub struct CreateTapplet {
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

impl From<&TappletManifest> for CreateTapplet {
  fn from(tapplet_manifest: &TappletManifest) -> Self {
    CreateTapplet {
      registry_id: tapplet_manifest.id.clone(),
      display_name: tapplet_manifest.metadata.display_name.clone(),
      author_name: tapplet_manifest.metadata.author.name.clone(),
      author_website: tapplet_manifest.metadata.author.website.clone(),
      about_summary: tapplet_manifest.metadata.about.summary.clone(),
      about_description: tapplet_manifest.metadata.about.description.clone(),
      category: tapplet_manifest.metadata.category.clone(),
      package_name: tapplet_manifest.metadata.source.location.npm.package_name.clone(),
      registry_url: tapplet_manifest.metadata.source.location.npm.registry.clone(),
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
pub struct CreateAsset {
  pub rel_path: String,
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
pub struct CreateTappletVersion {
  pub tapplet_id: Option<i32>,
  pub version: String,
  pub checksum: String,
}

#[derive(Debug, AsChangeset)]
#[diesel(table_name = tapplet_version)]
pub struct UpdateTappletVersion {
  pub tapplet_id: Option<i32>,
  pub version: String,
  pub checksum: String,
}
