import { createEntityAdapter } from "@reduxjs/toolkit"
import { TappletStoreState } from "./registeredTapplets.types"
import { RegisteredTapplet } from "@type/tapplet"

export const registeredTappletAdapter = createEntityAdapter<RegisteredTapplet>()

export const TappletStoreInitialState: TappletStoreState = {
  isInitialized: false,
  isFetching: false,
  registeredTapplets: registeredTappletAdapter.getInitialState(),
}
