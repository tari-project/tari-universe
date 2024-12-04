import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"

const providerStateSelector = (state: RootState) => state.provider

const isInitialized = createSelector([providerStateSelector], (state) => state.isInitialized)

const selectProvider = createSelector([providerStateSelector], (state) => state.provider)

export const providerSelector = {
  isInitialized,
  selectProvider,
}
