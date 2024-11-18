import { TariUniverseProvider } from "@provider/TariUniverseProvider"

export type TransactionEvent = {
  methodName: Exclude<keyof TariUniverseProvider, "runOne">
  args: any[]
  id: number
}
