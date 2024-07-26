import { DevTapplet, InstalledTappletWithName, RegisteredTapplet } from "@type/tapplet"

declare module "@tauri-apps/api/core" {
  function invoke(param: "read_installed_tapp_db"): Promise<InstalledTappletWithName[]>
  function invoke(param: "read_dev_tapplets"): Promise<DevTapplet[]>
  function invoke(param: "calculate_and_validate_tapp_checksum", payload: { tappletId: string }): Promise<boolean>
  function invoke(param: "read_tapp_registry_db"): Promise<RegisteredTapplet[]>
}
