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
const ERROR_CONTEXT_VAULE_SEPARATOR = "&"

export const resolveBackendErrorMessage = (
  translator: TFunction<"errors", undefined>,
  error: string,
  lng: Language
) => {
  const [translationKey, context] = error.split(ERROR_KEY_SEPARATOR)
  const contextValues: Record<string, string> = context
    .split(ERROR_CONTEXT_VAULE_SEPARATOR)
    .reduce<Record<string, string>>((acc, item) => {
      const [key, value] = item.split("-")
      acc[key.trim()] = value.trim()
      return acc
    }, {})

  return translator(translationKey.trim(), { ...contextValues, lng })
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
    return message
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
