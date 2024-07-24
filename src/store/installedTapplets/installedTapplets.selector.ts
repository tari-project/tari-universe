import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { installedTappletAdapter } from "./installedTapplets.slice"

const installedTappletsStateSelector = (state: RootState) => state.installedTapplets
export const installedTappletsSelectors = installedTappletAdapter.getSelectors<RootState>(
  (state) => state.installedTapplets.installedTapplets
)

const getAllInstalledTapplets = createSelector([installedTappletsStateSelector], (state) => state.installedTapplets)
const isInitialized = createSelector([installedTappletsStateSelector], (state) => state.isInitialized)

export const installedTappletsSelector = {
  getAllInstalledTapplets,
  isInitialized,
}
