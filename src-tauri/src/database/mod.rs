pub mod models;
pub mod schema;
pub mod store;

use diesel::prelude::*;
use diesel::sqlite::Sqlite;
use diesel_migrations::{ embed_migrations, EmbeddedMigrations, MigrationHarness };
use std::env;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

pub fn establish_connection() -> SqliteConnection {
  let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
  let mut db_connection = SqliteConnection::establish(&database_url).unwrap_or_else(|_|
    panic!("Error connecting to {}", database_url)
  );
  run_migrations(&mut db_connection).unwrap();
  db_connection
}
fn run_migrations(connection: &mut impl MigrationHarness<Sqlite>) -> Result<(), ()> {
  connection.run_pending_migrations(MIGRATIONS).unwrap();

  Ok(())
}
