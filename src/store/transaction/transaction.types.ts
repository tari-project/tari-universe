import { TariUniverseProvider } from "@provider/TariUniverseProvider"
import { BalanceUpdate } from "../simulation/simulation.types"

export type TransactionStatus = "pending" | "success" | "failure" | "cancelled"
export type TUProviderMethod = Exclude<keyof TariUniverseProvider, "runOne">

export type Transaction = {
  methodName: TUProviderMethod
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
