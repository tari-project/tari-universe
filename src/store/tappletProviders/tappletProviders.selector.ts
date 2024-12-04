import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { tappletProvidersAdapter } from "./tappletProviders.slice"

const selectTappletProviders = (state: RootState) => state.tappletProviders
const selectTappletProviderById = (_: RootState, id: string) => id

const tappletProvidersStateSelector = (state: RootState) => state.tappletProviders
export const tappletProvidersSelectors = tappletProvidersAdapter.getSelectors<RootState>(
  (state) => state.tappletProviders
)

const getAllTappletProviders = createSelector([tappletProvidersStateSelector], (state) => ({ ...state }))
const getTappletProviderById = createSelector(
  [selectTappletProviders, selectTappletProviderById],
  (providers, id) => providers.entities[id]
)
export const tappletProviderSelector = {
  getAllTappletProviders,
  getTappletProviderById,
}
