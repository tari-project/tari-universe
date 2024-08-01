import { ErrorSource, ErrorStoreState } from "./error.types"

export const errorStoreInitialState: ErrorStoreState = {
  message: "",
  isVisible: false,
  typeColor: "error",
  source: ErrorSource.FRONTEND,
}
