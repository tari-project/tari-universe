import { WalletDaemonTariProvider } from "@provider/TariUniverseProvider"

export type TransactionEvent = {
  methodName: Exclude<keyof WalletDaemonTariProvider, "runOne">
  args: any[]
  id: number
}
