import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"

const accountStateSelector = (state: RootState) => state.account

const isInitialized = createSelector([accountStateSelector], (state) => state.isInitialized)

const selectAccount = createSelector([accountStateSelector], (state) => state.account)

export const accountSelector = {
  isInitialized,
  selectAccount,
}
