import { DevTapplet } from "@type/tapplet"
import { EntityState } from "@reduxjs/toolkit"

export type TappletStoreState = {
  isInitialized: boolean
  isFetching: boolean
  devTapplets: EntityState<DevTapplet, string>
}

export type InitDevTappletsReqPayload = {}
export type InitDevTappletsSuccessPayload = {
  devTapplets: DevTapplet[]
}
export type InitDevTappletsFailurePayload = {
  errorMsg: string
}

export type DeleteDevTappletReqPayload = {
  item: DevTapplet
}
export type DeleteDevTappletSuccessPayload = {}
export type DeleteDevTappletFailurePayload = {
  errorMsg: string
}

export type AddDevTappletReqPayload = {
  tappletId: string
}
export type AddDevTappletSuccessPayload = {}
export type AddDevTappletFailurePayload = {
  errorMsg: string
}
