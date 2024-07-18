import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { transactionConfirmationStoreInitialState } from "./transactionConfirmation.constants"
import { ShowTransactionConfirmationPayload } from "./transactionConfirmation.types"

const transactionConfirmationSlice = createSlice({
  name: "transactionConfirmation",
  initialState: transactionConfirmationStoreInitialState,
  reducers: {
    showDialog: (state, action: PayloadAction<ShowTransactionConfirmationPayload>) => {
      state.message = action.payload.message
      state.transactionId = action.payload.transactionId
      state.isVisible = true
    },
    hideDialog: (state) => {
      state.message = ""
      state.isVisible = false
    },
  },
})

export const transactionConfirmationActions = transactionConfirmationSlice.actions
export const transactionConfirmationReducer = transactionConfirmationSlice.reducer
