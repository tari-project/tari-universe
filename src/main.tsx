import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./styles.css"
import { ThemeProvider } from "@emotion/react"
import { theme } from "./theme"
import { SnackBarProvider } from "./ErrorContext"
import { TariUniverseContextProvider } from "./ProviderContext"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <SnackBarProvider>
        <TariUniverseContextProvider>
          <App />
        </TariUniverseContextProvider>
      </SnackBarProvider>
    </ThemeProvider>
  </React.StrictMode>
)
