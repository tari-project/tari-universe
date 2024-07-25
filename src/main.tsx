import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./styles.css"
import { ThemeProvider } from "@emotion/react"
import { theme } from "./theme"
import { Provider } from "react-redux"
import { store } from "./store/store"
import { ErrorSnackBar } from "./components/ErrorSnackBar"
import { TransactionConfirmationModal } from "./components/TransactionConfirmationModal"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider store={store}>
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <TransactionConfirmationModal />
        <ErrorSnackBar />
        <App />
      </ThemeProvider>
    </React.StrictMode>
  </Provider>
)
