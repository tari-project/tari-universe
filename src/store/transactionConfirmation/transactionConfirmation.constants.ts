import { TransactionConfirmationStoreState } from "./transactionConfirmation.types"

export const transactionConfirmationStoreInitialState: TransactionConfirmationStoreState = {
  message: "",
  isVisible: false,
  transactionId: -1,
}
