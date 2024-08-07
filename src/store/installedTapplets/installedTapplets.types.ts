import { InstalledTappletWithName } from "@type/tapplet"
import { EntityState } from "@reduxjs/toolkit"

export type TappletStoreState = {
  isInitialized: boolean
  isFetching: boolean
  installedTapplets: EntityState<InstalledTappletWithName, string>
}

export type InitInstalledTappletsReqPayload = {}
export type InitInstalledTappletsSuccessPayload = {
  installedTapplets: InstalledTappletWithName[]
}
export type InitInstalledTappletsFailurePayload = {
  errorMsg: string
}

export type DeleteInstalledTappletReqPayload = {
  tappletId: string
}
export type DeleteInstalledTappletSuccessPayload = {}
export type DeleteInstalledTappletFailurePayload = {
  errorMsg: string
}

export type AddInstalledTappletReqPayload = {
  tappletId: string
}
export type AddInstalledTappletSuccessPayload = {}
export type AddInstalledTappletFailurePayload = {
  errorMsg: string
}

export type UpdateInstalledTappletReqPayload = {
  item: InstalledTappletWithName
}
export type UpdateInstalledTappletSuccessPayload = {
  installedTapplets: InstalledTappletWithName[]
}
export type UpdateInstalledTappletFailurePayload = {}
