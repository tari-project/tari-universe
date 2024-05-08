use crate::database::schema::*;
use diesel::prelude::*;
use serde::{ Deserialize, Serialize };

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
  pub tapplet_id: Option<i32>,
  pub is_dev_mode: bool,
  pub dev_mode_endpoint: &'a str,
  pub path_to_dist: &'a str,
}

#[derive(Debug, AsChangeset, Deserialize)]
#[diesel(table_name = installed_tapplet)]
pub struct UpdateInstalledTapplet {
  pub tapplet_id: Option<i32>,
  pub is_dev_mode: bool,
  pub dev_mode_endpoint: Option<String>,
  pub path_to_dist: Option<String>,
}

#[derive(Queryable, Selectable, Debug, Serialize)]
#[diesel(table_name = tapplet)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Tapplet {
  pub id: Option<i32>,
  pub package_name: String,
  pub version: String,
  pub image_id: Option<i32>,
  pub display_name: String,
  pub description: String,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = tapplet)]
pub struct CreateTapplet<'a> {
  pub package_name: &'a str,
  pub version: &'a str,
  pub image_id: Option<i32>,
  pub display_name: &'a str,
  pub description: &'a str,
}

#[derive(Debug, AsChangeset)]
#[diesel(table_name = tapplet)]
pub struct UpdateTapplet {
  pub package_name: String,
  pub version: String,
  pub image_id: Option<i32>,
  pub display_name: String,
  pub description: String,
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
