import { TUInternalProvider } from "@provider/TUInternalProvider"
import { TappletPermissions } from "@type/tapplet"

export type ProviderStoreState = {
  isInitialized: boolean
  provider: TUInternalProvider | null
  permissions: TappletPermissions
}

export type InitProviderRequestPayload = {}
export type InitProviderFailurePayload = {
  errorMsg: string
}
export type InitProviderSuccessPayload = {
  provider: TUInternalProvider
}

export type UpdatePermissionsRequestPayload = {
  permissions: TappletPermissions
}
export type UpdatePermissionsSuccessPayload = {
  permissions: TappletPermissions
}
export type UpdatePermissionsFailurePayload = {
  errorMsg: string
}
