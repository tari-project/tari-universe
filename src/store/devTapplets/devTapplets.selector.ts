import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { devTappletAdapter } from "./devTapplets.slice"

const devTappletsStateSelector = (state: RootState) => state.devTapplets
export const devTappletsSelectors = devTappletAdapter.getSelectors<RootState>((state) => state.devTapplets.devTapplets)

const getAlldevTapplets = createSelector([devTappletsStateSelector], (state) => state.devTapplets)
const isInitialized = createSelector([devTappletsStateSelector], (state) => state.isInitialized)

export const devTappletsSelector = {
  getAlldevTapplets,
  isInitialized,
}
