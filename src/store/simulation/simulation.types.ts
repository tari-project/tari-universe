export type SimulationStatus = "pending" | "success" | "failure"

export type Simulation = {
  transactionId: number
  status: SimulationStatus
  balanceUpdates: BalanceUpdate[]
  errorMsg: string
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
}
export type SimulationFailurePayload = {
  transactionId: number
  errorMsg: string
}
