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
  FOREIGN KEY (tapplet_id) REFERENCES tapplet(id)
);

CREATE TABLE installed_tapplet (
  id INTEGER PRIMARY KEY,
  tapplet_id INTEGER,
  is_dev_mode BOOLEAN DEFAULT FALSE NOT NULL,
  dev_mode_endpoint TEXT,
  path_to_dist TEXT,
  FOREIGN KEY (tapplet_id) REFERENCES tapplet(id)
);

CREATE TABLE asset (
  id INTEGER PRIMARY KEY,
  rel_path TEXT NOT NULL
);