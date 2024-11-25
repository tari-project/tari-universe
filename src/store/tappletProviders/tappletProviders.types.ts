import { EntityState } from "@reduxjs/toolkit"
import { TariProvider } from "@tari-project/tarijs"
import { TariPermission } from "@tari-project/tarijs/dist/providers/tari_universe"
import { LaunchedTappResult } from "@type/tapplet"

export type TappletProvider = {
  id: number
  provider: TariProvider
  permissions: TariPermission[]
}

export type TappletProvidersStoreState = {
  isInitialized: boolean
  tappletProviders: EntityState<TappletProvider, number>
}

export type InitTappletProvidersRequestPayload = {}
export type InitTappletProvidersFailurePayload = {
  errorMsg: string
}
export type InitTappletProvidersSuccessPayload = {
  tappletProviders: TappletProvider[]
}
export type AddTappletProviderRequestPayload = {
  installedTappletId: number
  launchedTappParams: LaunchedTappResult
}
export type AddTappletProviderSuccessPayload = {
  tappletProvider: TappletProvider
}
export type AddTappletProviderFailurePayload = {
  errorMsg: string
}
