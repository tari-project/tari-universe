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
  methodName: Exclude<keyof WalletDaemonTariProvider, "runOne">
  id: number
  args: any[]
  eventSource: typeof window.postMessage
}
export type TransactionFailurePayload = {
  errorMsg: string
}
export type TransactionSuccessPayload = {
  provider: WalletDaemonTariProvider
}
