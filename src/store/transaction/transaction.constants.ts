import { createEntityAdapter } from "@reduxjs/toolkit"
import { TransactionStoreState, TransactionData } from "./transaction.types"

export const transactionAdapter = createEntityAdapter<TransactionData>()

export const transactionStoreInitialState: TransactionStoreState = {
  methodName: null,
  args: [],
  isInProgress: false,
  isVisible: false,
  transaction: transactionAdapter.getInitialState({
    id: -1,
    eventSource: null,
  }),
}
