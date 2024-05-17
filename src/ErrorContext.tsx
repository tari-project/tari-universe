import { Alert, AlertColor, Snackbar } from "@mui/material"
import { ReactNode, createContext, useContext, useState } from "react"

type SnackBarContextActions = {
  showSnackBar: (text: string, typeColor: AlertColor) => void
}

const SnackBarContext = createContext({} as SnackBarContextActions)

interface SnackBarContextProviderProps {
  children: ReactNode
}

const SnackBarProvider: React.FC<SnackBarContextProviderProps> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("")
  const [typeColor, setTypeColor] = useState<AlertColor>("info")

  const showSnackBar = (text: string, color: AlertColor) => {
    setMessage(text)
    setTypeColor(color)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setTypeColor("info")
  }

  return (
    <SnackBarContext.Provider value={{ showSnackBar }}>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={typeColor}>
          {message}
        </Alert>
      </Snackbar>
      {children}
    </SnackBarContext.Provider>
  )
}

const useSnackBar = (): SnackBarContextActions => {
  const context = useContext(SnackBarContext)

  if (!context) {
    throw new Error("useSnackBar must be used within an SnackBarProvider")
  }

  return context
}

export { SnackBarProvider, useSnackBar }
