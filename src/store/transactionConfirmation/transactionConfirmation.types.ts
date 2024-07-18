export type TransactionConfirmationStoreState = {
  message: string
  isVisible: boolean
  transactionId: number
}

export type ShowTransactionConfirmationPayload = {
  message: string
  transactionId: number
}
