use std::ops::DerefMut;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::MutexGuard;

use diesel::prelude::*;
use diesel::SqliteConnection;

use crate::database::models::TappletVersion;
use crate::database::models::{
  Asset,
  CreateAsset,
  CreateInstalledTapplet,
  CreateTapplet,
  InstalledTapplet,
  Tapplet,
  UpdateTapplet,
};
use crate::interface::InstalledTappletWithName;

use super::models::CreateDevTapplet;
use super::models::CreateTappletVersion;
use super::models::DevTapplet;
use super::models::UpdateAsset;
use super::models::UpdateDevTapplet;
use super::models::UpdateInstalledTapplet;
use super::models::UpdateTappletVersion;

pub struct SqliteStore {
  connection: Arc<Mutex<SqliteConnection>>,
}

impl SqliteStore {
  pub fn new(connection: Arc<Mutex<SqliteConnection>>) -> Self {
    Self { connection }
  }

  pub fn get_connection(&self) -> MutexGuard<SqliteConnection> {
    self.connection.lock().unwrap()
  }
}

pub trait Store<T, U, G> {
  fn get_all(&mut self) -> Vec<T>;
  fn get_by_id(&mut self, id: i32) -> Option<T>;
  fn create(&mut self, item: &U) -> Vec<T>;
  fn delete(&mut self, entity: T);
  fn update(&mut self, old: T, new: &G);
}

impl SqliteStore {
  pub fn get_installed_tapplets_with_display_name(&mut self) -> Vec<InstalledTappletWithName> {
    use crate::database::schema::installed_tapplet::dsl::*;
    use crate::database::schema::tapplet;

    installed_tapplet
      .inner_join(tapplet::table)
      .select((installed_tapplet::all_columns(), tapplet::display_name))
      .load::<(InstalledTapplet, String)>(self.get_connection().deref_mut())
      .expect("Error loading installed tapplets with display name")
      .into_iter()
      .map(|(tapplet, display_name)| InstalledTappletWithName { installed_tapplet: tapplet, display_name })
      .collect()
  }

  pub fn get_installed_tapplet_full_by_id(
    &mut self,
    installed_tapplet_id: i32
  ) -> Option<(InstalledTapplet, Tapplet, TappletVersion)> {
    use crate::database::schema::installed_tapplet::dsl::id;
    use crate::database::schema::installed_tapplet::dsl::*;
    use crate::database::schema::tapplet::dsl::*;
    use crate::database::schema::tapplet_version::dsl::*;

    installed_tapplet
      .filter(id.eq(installed_tapplet_id))
      .inner_join(tapplet)
      .inner_join(tapplet_version)
      .select((installed_tapplet::all_columns(), tapplet::all_columns(), tapplet_version::all_columns()))
      .first::<(InstalledTapplet, Tapplet, TappletVersion)>(self.get_connection().deref_mut())
      .ok()
  }
}

impl<'a> Store<Tapplet, CreateTapplet<'a>, UpdateTapplet> for SqliteStore {
  fn get_all(&mut self) -> Vec<Tapplet> {
    use crate::database::schema::tapplet::dsl::*;

    tapplet.load::<Tapplet>(self.get_connection().deref_mut()).expect("Error loading tapplets")
  }

  fn get_by_id(&mut self, tapplet_id: i32) -> Option<Tapplet> {
    use crate::database::schema::tapplet::dsl::*;

    tapplet.filter(id.eq(tapplet_id)).first::<Tapplet>(self.get_connection().deref_mut()).ok()
  }

  fn create(&mut self, item: &CreateTapplet) -> Vec<Tapplet> {
    use crate::database::schema::tapplet;

    diesel
      ::insert_into(tapplet::table)
      .values(item)
      .on_conflict(tapplet::package_name)
      .do_update()
      .set(UpdateTapplet::from(item))
      .get_results(self.get_connection().deref_mut())
      .expect("Error saving new tapplet")
  }

  fn delete(&mut self, entity: Tapplet) {
    use crate::database::schema::tapplet::dsl::*;

    diesel
      ::delete(tapplet.filter(id.eq(entity.id)))
      .execute(self.get_connection().deref_mut())
      .expect("Error deleting tapplet");
  }

  fn update(&mut self, old: Tapplet, new: &UpdateTapplet) {
    use crate::database::schema::tapplet::dsl::*;

    diesel
      ::update(tapplet.filter(id.eq(old.id)))
      .set(new)
      .execute(self.get_connection().deref_mut())
      .expect("Error updating tapplet");
  }
}

impl Store<InstalledTapplet, CreateInstalledTapplet, UpdateInstalledTapplet> for SqliteStore {
  fn get_all(&mut self) -> Vec<InstalledTapplet> {
    use crate::database::schema::installed_tapplet::dsl::*;

    installed_tapplet
      .load::<InstalledTapplet>(self.get_connection().deref_mut())
      .expect("Error loading installed tapplets")
  }

  fn get_by_id(&mut self, installed_tapplet_id: i32) -> Option<InstalledTapplet> {
    use crate::database::schema::installed_tapplet::dsl::*;

    installed_tapplet
      .filter(id.eq(installed_tapplet_id))
      .first::<InstalledTapplet>(self.get_connection().deref_mut())
      .ok()
  }

  fn create(&mut self, item: &CreateInstalledTapplet) -> Vec<InstalledTapplet> {
    use crate::database::schema::installed_tapplet;

    diesel
      ::insert_into(installed_tapplet::table)
      .values(item)
      .on_conflict((installed_tapplet::tapplet_id, installed_tapplet::tapplet_version_id))
      .do_update()
      .set(UpdateInstalledTapplet::from(item))
      .get_results(self.get_connection().deref_mut())
      .expect("Error saving new installed tapplet")
  }

  fn update(&mut self, old: InstalledTapplet, new: &UpdateInstalledTapplet) {
    use crate::database::schema::installed_tapplet::dsl::*;

    diesel
      ::update(installed_tapplet.filter(id.eq(old.id)))
      .set(new)
      .execute(self.get_connection().deref_mut())
      .expect("Error updating installed tapplet");
  }

  fn delete(&mut self, entity: InstalledTapplet) {
    use crate::database::schema::installed_tapplet::dsl::*;

    diesel
      ::delete(installed_tapplet.filter(id.eq(entity.id)))
      .execute(self.get_connection().deref_mut())
      .expect("Error deleting installed tapplet");
  }
}

impl<'a> Store<Asset, CreateAsset<'a>, UpdateAsset> for SqliteStore {
  fn get_all(&mut self) -> Vec<Asset> {
    use crate::database::schema::asset::dsl::*;

    asset.load::<Asset>(self.get_connection().deref_mut()).expect("Error loading assets")
  }

  fn get_by_id(&mut self, asset_id: i32) -> Option<Asset> {
    use crate::database::schema::asset::dsl::*;

    asset.filter(id.eq(asset_id)).first::<Asset>(self.get_connection().deref_mut()).ok()
  }

  fn create(&mut self, item: &CreateAsset) -> Vec<Asset> {
    use crate::database::schema::asset;

    diesel
      ::insert_into(asset::table)
      .values(item)
      .on_conflict_do_nothing()
      .get_results(self.get_connection().deref_mut())
      .expect("Error saving new asset")
  }

  fn update(&mut self, old: Asset, new: &UpdateAsset) {
    use crate::database::schema::asset::dsl::*;

    diesel
      ::update(asset.filter(id.eq(old.id)))
      .set(new)
      .execute(self.get_connection().deref_mut())
      .expect("Error updating asset");
  }

  fn delete(&mut self, entity: Asset) {
    use crate::database::schema::asset::dsl::*;

    diesel
      ::delete(asset.filter(id.eq(entity.id)))
      .execute(self.get_connection().deref_mut())
      .expect("Error deleting asset");
  }
}

impl<'a> Store<TappletVersion, CreateTappletVersion<'a>, UpdateTappletVersion> for SqliteStore {
  fn get_all(&mut self) -> Vec<TappletVersion> {
    use crate::database::schema::tapplet_version::dsl::*;

    tapplet_version.load::<TappletVersion>(self.get_connection().deref_mut()).expect("Error loading tapplet versions")
  }

  fn get_by_id(&mut self, tapplet_version_id: i32) -> Option<TappletVersion> {
    use crate::database::schema::tapplet_version::dsl::*;

    tapplet_version.filter(id.eq(tapplet_version_id)).first::<TappletVersion>(self.get_connection().deref_mut()).ok()
  }

  fn create(&mut self, item: &CreateTappletVersion) -> Vec<TappletVersion> {
    use crate::database::schema::tapplet_version;

    diesel
      ::insert_into(tapplet_version::table)
      .values(item)
      .on_conflict((tapplet_version::version, tapplet_version::tapplet_id))
      .do_update()
      .set(UpdateTappletVersion::from(item))
      .get_results(self.get_connection().deref_mut())
      .expect("Error saving new tapplet version")
  }

  fn update(&mut self, old: TappletVersion, new: &UpdateTappletVersion) {
    use crate::database::schema::tapplet_version::dsl::*;

    diesel
      ::update(tapplet_version.filter(id.eq(old.id)))
      .set(new)
      .execute(self.get_connection().deref_mut())
      .expect("Error updating tapplet version");
  }

  fn delete(&mut self, entity: TappletVersion) {
    use crate::database::schema::tapplet_version::dsl::*;

    diesel
      ::delete(tapplet_version.filter(id.eq(entity.id)))
      .execute(self.get_connection().deref_mut())
      .expect("Error deleting tapplet version");
  }
}

impl<'a> Store<DevTapplet, CreateDevTapplet<'a>, UpdateDevTapplet> for SqliteStore {
  fn get_all(&mut self) -> Vec<DevTapplet> {
    use crate::database::schema::dev_tapplet::dsl::*;

    dev_tapplet.load::<DevTapplet>(self.get_connection().deref_mut()).expect("Error loading tapplet versions")
  }

  fn get_by_id(&mut self, dev_tapplet_id: i32) -> Option<DevTapplet> {
    use crate::database::schema::dev_tapplet::dsl::*;

    dev_tapplet.filter(id.eq(dev_tapplet_id)).first::<DevTapplet>(self.get_connection().deref_mut()).ok()
  }

  fn create(&mut self, item: &CreateDevTapplet) -> Vec<DevTapplet> {
    use crate::database::schema::dev_tapplet;

    diesel
      ::insert_into(dev_tapplet::table)
      .values(item)
      .get_results(self.get_connection().deref_mut())
      .expect("Error saving new tapplet version")
  }

  fn update(&mut self, old: DevTapplet, new: &UpdateDevTapplet) {
    use crate::database::schema::dev_tapplet::dsl::*;

    diesel
      ::update(dev_tapplet.filter(id.eq(old.id)))
      .set(new)
      .execute(self.get_connection().deref_mut())
      .expect("Error updating tapplet version");
  }

  fn delete(&mut self, entity: DevTapplet) {
    use crate::database::schema::dev_tapplet::dsl::*;

    diesel
      ::delete(dev_tapplet.filter(id.eq(entity.id)))
      .execute(self.get_connection().deref_mut())
      .expect("Error deleting tapplet version");
  }
}
