import { TUInternalProvider } from "@provider/TUInternalProvider"
import { BalanceUpdate, TxSimulation } from "../simulation/simulation.types"
import { SubmitTransactionRequest } from "@tari-project/tarijs"
import { TransactionEvent } from "@type/transaction"
import { TappletProvider } from "@provider/TappletProvider"

export type TransactionStatus = "pending" | "success" | "failure" | "cancelled"
export type TUProviderMethod = Exclude<keyof TUInternalProvider, "runOne">
export type TappletProviderMethod = Exclude<keyof TappletProvider, "runOne">

export type Transaction = {
  methodName: TappletProviderMethod
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

export type InitTransactionRequestPayload = {
  provider: TappletProvider
  event: MessageEvent<TransactionEvent>
}
export type InitTransactionFailurePayload = {
  errorMsg: string
}
