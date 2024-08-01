import { AlertColor } from "@mui/material"

export enum ErrorSource {
  BACKEND = "backend",
  FRONTEND = "frontend",
}

export type ErrorStoreState = {
  message: string
  isVisible: boolean
  typeColor: AlertColor
  source: ErrorSource
}

export type ShowErrorPayload = {
  message: string
  errorSource: ErrorSource
}
