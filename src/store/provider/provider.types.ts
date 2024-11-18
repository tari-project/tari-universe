import { TariUniverseProvider } from "@provider/TariUniverseProvider"

export type ProviderStoreState = {
  isInitialized: boolean
  provider: TariUniverseProvider | null
}

export type InitProviderRequestPayload = {}
export type InitProviderFailurePayload = {
  errorMsg: string
}
export type InitProviderSuccessPayload = {
  provider: TariUniverseProvider
}
