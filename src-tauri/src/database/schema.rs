// @generated automatically by Diesel CLI.

diesel::table! {
    asset (id) {
        id -> Nullable<Integer>,
        rel_path -> Text,
    }
}

diesel::table! {
    installed_tapplet (id) {
        id -> Nullable<Integer>,
        tapplet_id -> Nullable<Integer>,
        is_dev_mode -> Bool,
        dev_mode_endpoint -> Nullable<Text>,
        path_to_dist -> Nullable<Text>,
    }
}

diesel::table! {
    tapplet (id) {
        id -> Nullable<Integer>,
        registry_id -> Text,
        display_name -> Text,
        author_name -> Text,
        author_website -> Text,
        about_summary -> Text,
        about_description -> Text,
        category -> Text,
        package_name -> Text,
        registry_url -> Text,
        image_id -> Nullable<Integer>,
    }
}

diesel::table! {
    tapplet_version (id) {
        id -> Nullable<Integer>,
        tapplet_id -> Nullable<Integer>,
        version -> Text,
        checksum -> Text,
    }
}

diesel::joinable!(installed_tapplet -> tapplet (tapplet_id));
diesel::joinable!(tapplet -> asset (image_id));
diesel::joinable!(tapplet_version -> tapplet (tapplet_id));

diesel::allow_tables_to_appear_in_same_query!(
    asset,
    installed_tapplet,
    tapplet,
    tapplet_version,
);
