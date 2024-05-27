pub mod models;
pub mod schema;
pub mod store;

use diesel::prelude::*;
use diesel::sqlite::Sqlite;
use diesel_migrations::{ embed_migrations, EmbeddedMigrations, MigrationHarness };

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");
const DATABASE_URL: &str = "../data/tari_universe.sqlite3"; // TODO use tauri api paths

pub fn establish_connection() -> SqliteConnection {
  let mut db_connection = SqliteConnection::establish(DATABASE_URL).unwrap_or_else(|_|
    panic!("Error connecting to {}", DATABASE_URL)
  );
  run_migrations(&mut db_connection).unwrap(); // TODO handle migrations error while running setup https://github.com/orgs/tari-project/projects/18/views/1?pane=issue&itemId=63753279
  db_connection
}
fn run_migrations(connection: &mut impl MigrationHarness<Sqlite>) -> Result<(), ()> {
  connection.run_pending_migrations(MIGRATIONS).unwrap();

  Ok(())
}
