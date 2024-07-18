import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./styles.css"
import { ThemeProvider } from "@emotion/react"
import { theme } from "./theme"
import { TariUniverseContextProvider } from "./ProviderContext"
import { TransactionConfirmationProvider } from "./TransactionConfirmationContext"
import { Provider } from "react-redux"
import { store } from "./store/store"
import { ErrorSnackBar } from "./components/ErrorSnackBar"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider store={store}>
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <ErrorSnackBar />
        <TransactionConfirmationProvider>
          <TariUniverseContextProvider>
            <App />
          </TariUniverseContextProvider>
        </TransactionConfirmationProvider>
      </ThemeProvider>
    </React.StrictMode>
  </Provider>
)
