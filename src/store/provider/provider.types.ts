import { TariUniverseProvider } from "@provider/TariUniverseProvider"
import { TariPermission } from "@tari-project/tarijs/dist/providers/tari_universe"

export type ProviderStoreState = {
  isInitialized: boolean
  provider: TariUniverseProvider | null
  permissions: TariPermission[]
}

export type InitProviderRequestPayload = {}
export type InitProviderFailurePayload = {
  errorMsg: string
}
export type InitProviderSuccessPayload = {
  provider: TariUniverseProvider
}

export type UpdatePermissionsRequestPayload = {
  permissions: TariPermission[]
}
export type UpdatePermissionsSuccessPayload = {
  permissions: TariPermission[]
}
export type UpdatePermissionsFailurePayload = {
  errorMsg: string
}
