import { PayloadAction, createEntityAdapter, createSlice } from "@reduxjs/toolkit"
import {
  Transaction,
  TransactionFailurePayload,
  TransactionRequestPayload,
  TransactionSuccessPayload,
} from "./transaction.types"
import { listenerMiddleware } from "../store.listener"
import { cancelTransactionAction, executeTransactionAction, transactionFailedAction } from "./transaction.action"

export const transactionsAdapter = createEntityAdapter<Transaction>()

const transactionSlice = createSlice({
  name: "transaction",
  initialState: transactionsAdapter.getInitialState(),
  reducers: {
    addTransaction: (state, action: PayloadAction<TransactionRequestPayload>) => {
      transactionsAdapter.addOne(state, action.payload.transaction)
    },
    sendTransactionRequest: (_, __: PayloadAction<TransactionRequestPayload>) => {},
    cancelTransaction: (state, action: PayloadAction<TransactionRequestPayload>) => {
      transactionsAdapter.updateOne(state, {
        id: action.payload.transaction.id,
        changes: { status: "cancelled" },
      })
    },
    sendTransactionSuccess: (state, action: PayloadAction<TransactionSuccessPayload>) => {
      transactionsAdapter.updateOne(state, {
        id: action.payload.id,
        changes: { status: "success" },
      })
    },
    sendTransactionFailure: (state, action: PayloadAction<TransactionFailurePayload>) => {
      transactionsAdapter.updateOne(state, {
        id: action.payload.id,
        changes: { status: "failure" },
      })
    },
  },
})

export const transactionActions = transactionSlice.actions
export const transactionReducer = transactionSlice.reducer

listenerMiddleware.startListening(executeTransactionAction())
listenerMiddleware.startListening(cancelTransactionAction())
listenerMiddleware.startListening(transactionFailedAction())
