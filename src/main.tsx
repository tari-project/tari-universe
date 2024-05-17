import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./styles.css"
import { ThemeProvider } from "@emotion/react"
import { theme } from "./theme"
import { SnackBarProvider } from "./ErrorContext"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <SnackBarProvider>
        <App />
      </SnackBarProvider>
    </ThemeProvider>
  </React.StrictMode>
)
