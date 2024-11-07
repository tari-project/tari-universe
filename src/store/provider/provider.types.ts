import { WalletDaemonTariProvider } from "@provider/TariUniverseProvider"
import { TariPermissions } from "@tari-project/tarijs"

export type ProviderStoreState = {
  isInitialized: boolean
  provider: WalletDaemonTariProvider | null
  permissions: TariPermissions | null
}

export type InitProviderRequestPayload = {}
export type InitProviderFailurePayload = {
  errorMsg: string
}
export type InitProviderSuccessPayload = {
  provider: WalletDaemonTariProvider
}

export type UpdatePermissionsSuccessPayload = {
  permissions: TariPermissions
}
