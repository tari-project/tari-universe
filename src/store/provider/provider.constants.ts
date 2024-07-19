import { ProviderStoreState } from "./provider.types"

export const ProviderStoreInitialState: ProviderStoreState = {
  isInitialized: false,
  isWaitingForTxResult: false,
  provider: null,
}
