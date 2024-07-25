import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"

const selectTransactions = (state: RootState) => state.transaction
const selectTransactionId = (_: RootState, transactionId: number) => transactionId

const getAllTransactions = createSelector([selectTransactions], (state) => ({ ...state }))
const getTransactionById = createSelector(
  [selectTransactions, selectTransactionId],
  (transactions, id: number) => transactions.entities[id]
)
const getPendingTransactions = createSelector([selectTransactions], (transactions) => {
  return Object.values(transactions.entities).filter((transaction) => transaction.status === "pending")
})

const getPendingTransaction = createSelector([getPendingTransactions], (transactions) => {
  return transactions.length > 0 ? transactions[0] : null
})

export const transactionSelector = {
  getAllTransactions,
  getTransactionById,
  getPendingTransactions,
  getPendingTransaction,
}
