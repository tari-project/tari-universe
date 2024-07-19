import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { transactionStoreInitialState } from "./transaction.constants"
import { ShowTransactionPayload } from "./transaction.types"

const transactionSlice = createSlice({
  name: "transaction",
  initialState: transactionStoreInitialState,
  reducers: {
    showDialog: (state, action: PayloadAction<ShowTransactionPayload>) => {
      state.isVisible = true
      state.methodName = action.payload.methodName
      state.args = action.payload.args
      state.transaction = action.payload.transaction
    },
    reject: (state) => {
      state.isInProgress = true
    },
    submit: (state) => {
      state.isInProgress = true
    },
    hideDialog: (state) => {
      state.isInProgress = false
      state.isVisible = false
    },
  },
})

export const transactionActions = transactionSlice.actions
export const transactionReducer = transactionSlice.reducer
