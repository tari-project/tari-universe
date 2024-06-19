import React from "react"
import ReactDOM from "react-dom/client"
import "./styles.css"
import { ThemeProvider } from "@emotion/react"
import { theme } from "./theme"
import { ErrorPage } from "./components/ErrorPage"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <ErrorPage />
    </ThemeProvider>
  </React.StrictMode>
)
