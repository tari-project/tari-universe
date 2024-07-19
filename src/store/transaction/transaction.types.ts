export type TransactionStoreState = {
  methodName: string
  args: any[]
  isVisible: boolean
  isInProgress: boolean
  transaction: TransactionData
}

export type TransactionData = {
  id: number
  eventSource: typeof window.postMessage | null
}

export type ShowTransactionPayload = {
  methodName: string
  args: any[]
  transaction: TransactionData
}
