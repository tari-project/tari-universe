import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"

const errorStateSelector = (state: RootState) => state.error

const selectError = createSelector([errorStateSelector], (state) => ({ ...state }))

export const errorSelector = {
  selectError,
}
