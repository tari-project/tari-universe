import { WalletDaemonTariProvider } from "@provider/TariUniverseProvider"

export type ProviderStoreState = {
  isInitialized: boolean
  isWaitingForTxResult: boolean
  provider: WalletDaemonTariProvider | null
}

export type TappletTransactionReqEvent = {
  methodName: string
  args: any[]
}

export type InitProviderRequestPayload = {}
export type InitProviderFailurePayload = {
  errorMsg: string
}
export type InitProviderSuccessPayload = {
  provider: WalletDaemonTariProvider
}
export type TransactionRequestPayload = {
  methodName: string
}
export type TransactionFailurePayload = {
  errorMsg: string
}
export type TransactionSuccessPayload = {
  provider: WalletDaemonTariProvider
}
