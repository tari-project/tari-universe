import { RegisteredTapplet, RegisteredTappletWithAssets } from "../../types/tapplet"
import { EntityState } from "@reduxjs/toolkit"

export type TappletStoreState = {
  isInitialized: boolean
  isFetching: boolean
  registeredTapplets: EntityState<RegisteredTapplet, string>
}

export type InitRegisteredTappletsReqPayload = {}
export type InitRegisteredTappletsSuccessPayload = {
  registeredTapplets: RegisteredTappletWithAssets[]
}
export type InitRegisteredTappletsFailurePayload = {
  errorMsg: string
}
