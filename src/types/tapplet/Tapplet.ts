//TODO tauri commands cammelCase to snake
export type RegisteredTapplet = {
  id?: number
  registry_id: string
  display_name: string
  author_name: string
  author_website: string
  about_summary: string
  about_description: string
  category: string
  package_name: string
  registry_url: string
  image_id?: number
}

export type InstalledTapplet = {
  id?: number
  tapplet_id?: number
  is_dev_mode: boolean
  dev_mode_endpoint?: string
  path_to_dist?: string
}
