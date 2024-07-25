import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { registeredTappletAdapter } from "./registeredTapplets.slice"

const registeredTappletsStateSelector = (state: RootState) => state.registeredTapplets

export const registeredTappletsSelectors = registeredTappletAdapter.getSelectors<RootState>(
  (state) => state.registeredTapplets.registeredTapplets
)

const isInitialized = createSelector([registeredTappletsStateSelector], (state) => state.isInitialized)

const isFetching = createSelector([registeredTappletsStateSelector], (state) => state.isFetching)

export const registeredTappletSelector = {
  isInitialized,
  isFetching,
}
