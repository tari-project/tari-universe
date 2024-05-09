//TODO tauri commands cammelCase to snake
export type RegisteredTapplet = {
  id?: number
  package_name: string
  version: string
  display_name: string
  description: string
  image_id?: number
}

export type InstalledTapplet = {
  id?: number
  tapplet_id: number
  is_dev_mode: boolean
  dev_mode_endpoint: string
  path_to_dist: string
}