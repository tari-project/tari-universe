import { DevTapplet, InstalledTappletWithName, RegisteredTapplet } from "@type/tapplet"
import { AccountsGetBalancesResponse } from "@tari-project/typescript-bindings"

declare module "@tauri-apps/api/core" {
  function invoke(param: "read_installed_tapp_db"): Promise<InstalledTappletWithName[]>
  function invoke(param: "read_dev_tapplets"): Promise<DevTapplet[]>
  function invoke(param: "read_tapp_registry_db"): Promise<RegisteredTapplet[]>
  function invoke(
    param: "update_tapp",
    payload: { tappletId: string; installedTappletId: string }
  ): Promise<InstalledTappletWithName[]>
  function invoke(param: "get_balances", payload: {}): Promise<AccountsGetBalancesResponse>
  function invoke(param: "get_assets_server_addr"): Promise<string>
}
