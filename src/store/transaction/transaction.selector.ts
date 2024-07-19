import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"

const transactionStateSelector = (state: RootState) => state.transaction

const selectTransaction = createSelector([transactionStateSelector], (state) => ({ ...state }))

export const transactionSelector = {
  selectTransaction,
}
