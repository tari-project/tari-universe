import { TUInternalProvider } from "@provider/TUInternalProvider"
import {
  SubstateDiff,
  TransactionResult,
  VaultId,
  Vault,
  SubstateId,
  SubstateValue,
  ResourceContainer,
  ResourceAddress,
  Amount,
} from "@tari-project/typescript-bindings"

export type TransactionEvent = {
  methodName: Exclude<keyof TUInternalProvider, "runOne">
  args: any[]
  id: number
}

export const txCheck = {
  isAccept: (result: TransactionResult): result is { Accept: SubstateDiff } => {
    return "Accept" in result
  },

  isVaultId: (substateId: SubstateId): substateId is { Vault: VaultId } => {
    return "Vault" in substateId
  },

  isVaultSubstate: (substate: SubstateValue): substate is { Vault: Vault } => {
    return "Vault" in substate
  },

  isFungible: (
    resourceContainer: ResourceContainer
  ): resourceContainer is { Fungible: { address: ResourceAddress; amount: Amount; locked_amount: Amount } } => {
    return "Fungible" in resourceContainer
  },
}
