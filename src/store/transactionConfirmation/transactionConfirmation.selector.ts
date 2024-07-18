import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"

const transactionConfirmationStateSelector = (state: RootState) => state.transactionConfirmation

const selectTransactionConfirmation = createSelector([transactionConfirmationStateSelector], (state) => ({ ...state }))

export const transactionConfirmationSelector = {
  selectTransactionConfirmation,
}
