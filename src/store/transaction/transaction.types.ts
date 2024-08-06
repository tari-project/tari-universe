import { WalletDaemonTariProvider } from "@provider/TariUniverseProvider"
import { BalanceUpdate } from "../simulation/simulation.types"

export type TransactionStatus = "pending" | "success" | "failure" | "cancelled"

export type Transaction = {
  methodName: Exclude<keyof WalletDaemonTariProvider, "runOne">
  args: any[]
  id: number
  submit: () => void
  cancel: () => void
  runSimulation: () => Promise<BalanceUpdate[]>
  status: TransactionStatus
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
