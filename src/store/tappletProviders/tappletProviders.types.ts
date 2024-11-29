import { TappletProvider } from "@provider/TappletProvider"
import { EntityState } from "@reduxjs/toolkit"
import { LaunchedTappResult, TappletPermissions } from "@type/tapplet"

export type TappletProvidersStoreState = {
  tappletProviders: EntityState<TappletProvider, string>
}

export type InitTappletProvidersRequestPayload = {}
export type InitTappletProvidersFailurePayload = {
  errorMsg: string
}
export type InitTappletProvidersSuccessPayload = {
  tappletProviders: TappletProvider[]
}
export type AddTappletProviderRequestPayload = {
  id: string
  launchedTappParams: LaunchedTappResult
}
export type AddTappletProviderSuccessPayload = {
  tappletProvider: TappletProvider
}
export type AddTappletProviderFailurePayload = {
  errorMsg: string
}

export type DeleteTappletProviderRequestPayload = {
  id: string
}
export type DeleteTappletProviderSuccessPayload = {
  id: string
}
export type DeleteTappletProviderFailurePayload = {
  errorMsg: string
}

export type UpdateTappletProviderRequestPayload = {
  id: string
  permissions: TappletPermissions
}
export type UpdateTappletProviderSuccessPayload = {
  tappletProvider: TappletProvider
}
export type UpdateTappletProviderFailurePayload = {
  errorMsg: string
}
