import { WalletDaemonTariProvider } from "@provider/TariUniverseProvider"

export type TransactionStoreState = {
  methodName: Exclude<keyof WalletDaemonTariProvider, "runOne"> | null
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
  methodName: Exclude<keyof WalletDaemonTariProvider, "runOne">
  args: any[]
  transaction: TransactionData
}
