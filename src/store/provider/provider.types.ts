import { WalletDaemonTariProvider } from "@provider/TariUniverseProvider"

export type ProviderStoreState = {
  isInitialized: boolean
  provider: WalletDaemonTariProvider | null
}

export type InitProviderRequestPayload = {}
export type InitProviderFailurePayload = {
  errorMsg: string
}
export type InitProviderSuccessPayload = {
  provider: WalletDaemonTariProvider
}
