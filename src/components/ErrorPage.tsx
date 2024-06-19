import { Box, Button, Typography } from "@mui/material"
import { getCurrent } from "@tauri-apps/api/window"
import React from "react"

declare global {
  interface Window {
    setupErrorMessage: string
  }
}

window.setupErrorMessage = window.setupErrorMessage

export const ErrorPage: React.FC = () => {
  function closeApp() {
    const window = getCurrent()
    window.close()
  }
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Typography variant="h3">Tari Universe Crashed</Typography>
      <Typography variant="body1">{window.setupErrorMessage}</Typography>
      <Button onClick={closeApp} variant="outlined">
        <Typography>Close Tari Universe</Typography>
      </Button>
    </Box>
  )
}
