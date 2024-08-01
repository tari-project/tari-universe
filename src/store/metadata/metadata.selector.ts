import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"

const metadataStateSelector = (state: RootState) => state.metadata

const selectCurrentLanguage = createSelector([metadataStateSelector], (state) => state.currentLanguage)

export const metadataSelector = {
  selectCurrentLanguage,
}
