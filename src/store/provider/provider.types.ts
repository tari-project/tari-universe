import { WalletDaemonTariProvider } from "@provider/TariUniverseProvider"
import { TariPermission } from "@tari-project/tarijs/dist/providers/tari_universe"

export type ProviderStoreState = {
  isInitialized: boolean
  provider: WalletDaemonTariProvider | null
  permissions: TariPermission[]
}

export type InitProviderRequestPayload = {}
export type InitProviderFailurePayload = {
  errorMsg: string
}
export type InitProviderSuccessPayload = {
  provider: WalletDaemonTariProvider
}

export type UpdatePermissionsSuccessPayload = {
  permissions: TariPermission[]
}
