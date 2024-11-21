import { TUInternalProvider } from "@provider/TUInternalProvider"
import { BalanceUpdate, TxSimulation } from "../simulation/simulation.types"
import { SubmitTransactionRequest } from "@tari-project/tarijs"

export type TransactionStatus = "pending" | "success" | "failure" | "cancelled"
export type TUProviderMethod = Exclude<keyof TUInternalProvider, "runOne">

export type Transaction = {
  methodName: TUProviderMethod
  args: SubmitTransactionRequest[]
  id: number
  submit: () => void
  cancel: () => void
  runSimulation: () => Promise<{ balanceUpdates: BalanceUpdate[]; txSimulation: TxSimulation }>
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
