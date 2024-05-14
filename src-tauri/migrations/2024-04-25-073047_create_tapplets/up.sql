-- Your SQL goes here
-- This file should undo anything in `up.sql`
CREATE TABLE tapplet (
  id INTEGER PRIMARY KEY,
  registry_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_website TEXT NOT NULL,
  about_summary TEXT NOT NULL,
  about_description TEXT NOT NULL,
  category TEXT NOT NULL,
  package_name TEXT NOT NULL,
  registry_url TEXT NOT NULL,
  image_id INTEGER,
  UNIQUE(package_name),
  FOREIGN KEY (image_id) REFERENCES asset(id)
);

CREATE TABLE tapplet_version (
  id INTEGER PRIMARY KEY,
  tapplet_id INTEGER,
  version TEXT NOT NULL,
  checksum TEXT NOT NULL,
  UNIQUE(version, tapplet_id),
  FOREIGN KEY (tapplet_id) REFERENCES tapplet(id)
);

CREATE TABLE installed_tapplet (
  id INTEGER PRIMARY KEY,
  tapplet_id INTEGER,
  tapplet_version_id INTEGER,
  is_dev_mode BOOLEAN DEFAULT FALSE NOT NULL,
  dev_mode_endpoint TEXT,
  path_to_dist TEXT,
  UNIQUE(tapplet_id, tapplet_version_id),
  FOREIGN KEY (tapplet_id) REFERENCES tapplet(id)
  FOREIGN KEY (tapplet_version_id) REFERENCES tapplet_version(id)
);

CREATE TABLE asset (
  id INTEGER PRIMARY KEY,
  rel_path TEXT NOT NULL
);
