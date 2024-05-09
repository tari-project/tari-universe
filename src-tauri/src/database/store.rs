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

use super::models::CreateTappletVersion;
use super::models::UpdateAsset;
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
  fn create(&mut self, item: &U) -> Vec<T>;
  fn delete(&mut self, entity: T);
  fn update(&mut self, old: T, new: &G);
}

impl<'a> Store<Tapplet, CreateTapplet<'a>, UpdateTapplet> for SqliteStore {
  fn get_all(&mut self) -> Vec<Tapplet> {
    use crate::database::schema::tapplet::dsl::*;

    tapplet.load::<Tapplet>(self.get_connection().deref_mut()).expect("Error loading tapplets")
  }

  fn create(&mut self, item: &CreateTapplet) -> Vec<Tapplet> {
    use crate::database::schema::tapplet;

    diesel
      ::insert_into(tapplet::table)
      .values(item)
      .on_conflict_do_nothing()
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

impl<'a> Store<InstalledTapplet, CreateInstalledTapplet<'a>, UpdateInstalledTapplet> for SqliteStore {
  fn get_all(&mut self) -> Vec<InstalledTapplet> {
    use crate::database::schema::installed_tapplet::dsl::*;

    installed_tapplet
      .load::<InstalledTapplet>(self.get_connection().deref_mut())
      .expect("Error loading installed tapplets")
  }

  fn create(&mut self, item: &CreateInstalledTapplet) -> Vec<InstalledTapplet> {
    use crate::database::schema::installed_tapplet;

    diesel
      ::insert_into(installed_tapplet::table)
      .values(item)
      .on_conflict_do_nothing()
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

  fn create(&mut self, item: &CreateTappletVersion) -> Vec<TappletVersion> {
    use crate::database::schema::tapplet_version;

    diesel
      ::insert_into(tapplet_version::table)
      .values(item)
      .on_conflict_do_nothing()
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
