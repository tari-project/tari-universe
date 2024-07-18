import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { registeredTappletAdapter } from "./registeredTapplets.constants"

const selectAccessToken = createSelector(
  [(state: RootState) => state?.registeredTapplets?.registeredTapplets],
  (state) => (id?: string) => {
    if (!id) return null

    const token = registeredTappletAdapter.getSelectors().selectById(state, id)

    return token
  }
)

const isInitialized = createSelector(
  (state: RootState) => state.registeredTapplets.isInitialized,
  (isInitialized) => isInitialized
)

const isFetching = createSelector(
  (state: RootState) => state.registeredTapplets.isFetching,
  (isFetching) => isFetching
)

export const tappletSelector = {
  selectAccessToken,
  isInitialized,
  isFetching,
}
