import { useDispatch, useSelector } from "react-redux"
import { errorSelector } from "../store/error/error.selector"
import { errorActions } from "../store/error/error.slice"
import { Alert, Snackbar } from "@mui/material"
import { useTranslation } from "react-i18next"
import { TFunction } from "i18next"
import { metadataSelector } from "../store/metadata/metadata.selector"
import React from "react"
import { Language } from "../i18initializer"

const ERROR_KEY_SEPARATOR = "|"

export const resolveBackendErrorMessage = (
  translator: TFunction<"errors", undefined>,
  error: string,
  lng: Language
): string => {
  const parts = error.split(ERROR_KEY_SEPARATOR)

  if (parts.length < 2) {
    return translator(error.trim(), { lng })
  }

  // Extract the nested error name
  const nestedErrorPart = parts[1].trim() // Get the second part
  const translationKey = nestedErrorPart.split("-").slice(1).join("-") // Extract everything after 'message-'

  // Extract the method and params from the remaining part
  const context = parts.slice(2).join(ERROR_KEY_SEPARATOR) // Join the remaining parts back
  const methodMatch = context.match(/method-([a-zA-Z0-9._]+)/)
  const paramsMatch = context.match(/params-(.*)/)

  const method = methodMatch ? methodMatch[1] : "unknown method"
  const params = paramsMatch ? JSON.parse(paramsMatch[1]) : {}

  const formattedParams = JSON.stringify(params, null, 2)
    .replace(/"([^"]+)":/g, "$1:") // Remove quotes from keys
    .replace(/"([^"]+)"/g, "$1") // Remove quotes from string value

  return translator(translationKey.trim(), { method, params: formattedParams, lng })
}

export const ErrorSnackBar = () => {
  const { isVisible, message, typeColor } = useSelector(errorSelector.selectError)
  const currentLanguage = useSelector(metadataSelector.selectCurrentLanguage)
  const { t } = useTranslation("errors")
  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(errorActions.hideError())
  }

  const displayedMessage = React.useMemo(() => {
    if (message && message.includes(ERROR_KEY_SEPARATOR)) {
      return resolveBackendErrorMessage(t, message, currentLanguage)
    }
    return t(message)
  }, [message, currentLanguage])

  return (
    <Snackbar
      open={isVisible}
      autoHideDuration={6000}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={typeColor}>
        {displayedMessage}
      </Alert>
    </Snackbar>
  )
}
