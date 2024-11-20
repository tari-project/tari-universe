import { TUInternalProvider } from "@provider/TUInternalProvider"
import { TariPermission } from "@tari-project/tarijs/dist/providers/tari_universe"

export type ProviderStoreState = {
  isInitialized: boolean
  provider: TUInternalProvider | null
  permissions: TariPermission[]
}

export type InitProviderRequestPayload = {}
export type InitProviderFailurePayload = {
  errorMsg: string
}
export type InitProviderSuccessPayload = {
  provider: TUInternalProvider
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
