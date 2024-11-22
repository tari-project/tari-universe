import { EntityState } from "@reduxjs/toolkit"
import { TariProvider } from "@tari-project/tarijs"
import { TariPermission } from "@tari-project/tarijs/dist/providers/tari_universe"

export type TappletProvider = {
  id: string
  provider: TariProvider
  permissions: TariPermission[]
}

export type TappletProvidersStoreState = {
  isInitialized: boolean
  tappletProviders: EntityState<TappletProvider, string>
}

export type InitTappletProvidersRequestPayload = {}
export type InitTappletProvidersFailurePayload = {
  errorMsg: string
}
export type InitTappletProvidersSuccessPayload = {
  tappletProviders: TappletProvider[]
}
export type AddTappletProvidersRequestPayload = {
  tappletProvider: TappletProvider
}
