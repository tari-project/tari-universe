import { Box, Button, Typography } from "@mui/material"
import { getCurrentWindow } from "@tauri-apps/api/window"
import React from "react"
import { useTranslation } from "react-i18next"

declare global {
  interface Window {
    setupErrorMessage: string
  }
}

window.setupErrorMessage = window.setupErrorMessage

export const ErrorPage: React.FC = () => {
  const { t } = useTranslation("components")
  function closeApp() {
    const window = getCurrentWindow()
    window.close()
  }
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Typography variant="h3">{t("tari-universe-crashed")}</Typography>
      <Typography variant="body1">{window.setupErrorMessage}</Typography>
      <Button onClick={closeApp} variant="outlined">
        <Typography>{t("close-tari-universe")}</Typography>
      </Button>
    </Box>
  )
}
