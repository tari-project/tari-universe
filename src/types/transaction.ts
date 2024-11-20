import { TUInternalProvider } from "@provider/TUInternalProvider"

export type TransactionEvent = {
  methodName: Exclude<keyof TUInternalProvider, "runOne">
  args: any[]
  id: number
}
