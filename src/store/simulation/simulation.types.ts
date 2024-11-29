import { TransactionStatus } from "@tari-project/tarijs"

export type SimulationStatus = "pending" | "success" | "failure"

export type Simulation = {
  transactionId: number
  status: SimulationStatus
  balanceUpdates: BalanceUpdate[]
  errorMsg: string
  transaction: TxSimulation
}

export type BalanceUpdate = {
  currentBalance: number
  newBalance: number
  vaultAddress: string
  tokenSymbol: string
}

export type SimulationRequestPayload = {
  transactionId: number
}
export type SimulationSuccessPayload = {
  transactionId: number
  balanceUpdates: BalanceUpdate[]
  transaction: TxSimulation
}
export type SimulationFailurePayload = {
  transactionId: number
  errorMsg: string
  transaction: TxSimulation
}

export type TxSimulation = {
  status: TransactionStatus
  errorMsg: string
}
