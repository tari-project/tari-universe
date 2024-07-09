import { ReactNode, createContext, useContext, useRef, useState } from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"

type TransactionConfirmationContextActions = {
  showTransactionConfirmation: (methodName: string, resolve: () => void, reject: () => void) => void
}

type TransactionConfirmationResponse = {
  resolve: () => void
  reject: () => void
}

const TransactionConfirmationContext = createContext({} as TransactionConfirmationContextActions)

interface TransactionConfirmationContextProviderProps {
  children: ReactNode
}

const TransactionConfirmationProvider: React.FC<TransactionConfirmationContextProviderProps> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [methodName, setMethodName] = useState<string>("")
  const response = useRef<TransactionConfirmationResponse>({ resolve: () => {}, reject: () => {} })

  const showTransactionConfirmation = (method: string, resolveCb: () => void, rejectCb: () => void) => {
    response.current.resolve = resolveCb
    response.current.reject = rejectCb
    setMethodName(method)
    setOpen(true)
  }

  const handleClose = async () => {
    response.current.reject()
    setOpen(false)
    setMethodName("")
  }

  const submitTransaction = async () => {
    response.current.resolve()
    setOpen(false)
    setMethodName("")
  }

  return (
    <TransactionConfirmationContext.Provider value={{ showTransactionConfirmation }}>
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle textAlign="center">Transaction confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>Method name: {methodName}</DialogContentText>
          <DialogContentText>TODO: display transaction simulation result</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            Cancel
          </Button>
          <Button onClick={submitTransaction} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      {children}
    </TransactionConfirmationContext.Provider>
  )
}

const useTransactionConfirmation = (): TransactionConfirmationContextActions => {
  const context = useContext(TransactionConfirmationContext)

  if (!context) {
    throw new Error("useTransactionConfirmation must be used within an TransactionConfirmationProvider")
  }

  return context
}

export { TransactionConfirmationProvider, useTransactionConfirmation }
