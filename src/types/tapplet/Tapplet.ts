export type RegisteredTapplet = {
  package_name: string
  version: string
  display_name: string
  description: string
  image_id?: number
}

export type InstalledTapplet = {
  tappletId: number
  isDevMode: boolean
  devModeEndpoint: string
  pathToDist: string
}
