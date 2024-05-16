//TODO tauri commands cammelCase to snake
export type RegisteredTapplet = {
  id?: number
  registry_id: string
  package_name: string
  display_name: string
  author_name: string
  author_website: string
  about_summary: string
  about_description: string
  category: string
  image_id?: number
}

export type InstalledTapplet = {
  id?: number
  tapplet_id?: number
  tapplet_version_id?: number
}

export interface InstalledTappletWithName {
  installed_tapplet: InstalledTapplet
  display_name: string
}

export interface DevTapplet {
  id?: number
  package_name: string
  endpoint: string
  tapplet_name: string
  display_name: string
  about_summary: string
  about_description: string
}

export interface TappletVersion {
  id?: number
  tapplet_id?: number
  version: string
  integrity: string
  registry_url: string
}

export interface RegisteredTappletWithVersion {
  registered_tapp: RegisteredTapplet
  tapp_version: TappletVersion
}

export interface InstalledTappletWithName {
  installed_tapplet: InstalledTapplet
  display_name: string
}
