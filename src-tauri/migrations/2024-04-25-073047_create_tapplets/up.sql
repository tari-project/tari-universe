-- Your SQL goes here
-- This file should undo anything in `up.sql`
CREATE TABLE tapplet (
  id INTEGER PRIMARY KEY,
  package_name TEXT NOT NULL,
  version TEXT NOT NULL,
  image_id INTEGER,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  UNIQUE(package_name, version),
  FOREIGN KEY (image_id) REFERENCES asset(id)
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
