import { WalletDaemonTariProvider } from "@provider/TariUniverseProvider"

export type TransactionStatus = "pending" | "success" | "failure" | "cancelled"

export type Transaction = {
  methodName: Exclude<keyof WalletDaemonTariProvider, "runOne">
  args: any[]
  id: number
  submit: () => void
  cancel: () => void
  status: TransactionStatus
}

export type TransactionStoreState = {
  transactions: Transaction[]
}

export type TransactionRequestPayload = {
  transaction: Transaction
}
export type TransactionFailurePayload = {
  errorMsg: string
  id: number
}
export type TransactionSuccessPayload = {
  id: number
}
