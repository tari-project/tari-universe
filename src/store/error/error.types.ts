import { AlertColor } from "@mui/material"

export type ErrorStoreState = {
  message: string
  isVisible: boolean
  typeColor: AlertColor
}

export type ShowErrorPayload = {
  message: string
}
