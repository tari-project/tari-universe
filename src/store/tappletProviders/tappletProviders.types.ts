import { EntityState } from "@reduxjs/toolkit"
import { TariProvider } from "@tari-project/tarijs"
import { LaunchedTappResult, TappletPermissions } from "@type/tapplet"

export type TappletProvider = {
  id: number
  provider: TariProvider
  permissions: TappletPermissions
}

export type TappletProvidersStoreState = {
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

export type DeleteTappletProviderRequestPayload = {
  tappletId: number
}
export type DeleteTappletProviderSuccessPayload = {
  tappletProviderId: number
}
export type DeleteTappletProviderFailurePayload = {
  errorMsg: string
}

export type UpdateTappletProviderRequestPayload = {
  tappletId: number
  permissions: TappletPermissions
}
export type UpdateTappletProviderSuccessPayload = {
  tappletProvider: TappletProvider
}
export type UpdateTappletProviderFailurePayload = {
  errorMsg: string
}
