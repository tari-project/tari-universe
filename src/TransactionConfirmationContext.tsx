import { ReactNode, createContext, useContext, useState } from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import { WalletDaemonTariProvider } from "@provider/TariUniverseProvider"
import { ProviderMethodNames } from "@tariproject/tarijs/dist/providers/tari_universe"

type TransactionConfirmationContextActions = {
  showTransactionConfirmation: (
    methodName: string,
    args: [string],
    provider: WalletDaemonTariProvider,
    event: any
  ) => void
}

const TransactionConfirmationContext = createContext({} as TransactionConfirmationContextActions)

interface TransactionConfirmationContextProviderProps {
  children: ReactNode
}

const TransactionConfirmationProvider: React.FC<TransactionConfirmationContextProviderProps> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [methodName, setMethodName] = useState<string>("")
  const [args, setArgs] = useState<string[]>([])
  const [provider, setProvider] = useState<WalletDaemonTariProvider | null>(null)
  const [event, setEvent] = useState<any>(null)

  const showTransactionConfirmation = (
    method: string,
    args: string[],
    provider: WalletDaemonTariProvider,
    event: any
  ) => {
    setProvider(provider)
    setEvent(event)
    setMethodName(method)
    setArgs(args)
    setOpen(true)
  }

  const handleClose = async () => {
    const resultError = "Transaction was cancelled"
    event.source.postMessage({ id: event.data.id, result: {}, resultError, type: "provider-call" }, event.origin)
    setOpen(false)
    setMethodName("")
    setArgs([])
    setProvider(null)
  }

  const submitTransaction = async () => {
    if (!provider || provider === null) {
      console.error("Provider is not initialized")
      const resultError = "Transaction was cancelled"
      event.source.postMessage({ id: event.data.id, resultError, type: "provider-call" }, event.origin)
      handleClose()
      return
    }
    const result = await provider.runOne(methodName as ProviderMethodNames, args)
    event.source.postMessage({ id: event.data.id, result, type: "provider-call" }, event.origin)
    setOpen(false)
    setMethodName("")
    setArgs([])
    setProvider(null)
  }

  return (
    <TransactionConfirmationContext.Provider value={{ showTransactionConfirmation }}>
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle textAlign="center">Transaction confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>Method name: {methodName}</DialogContentText>
          <DialogContentText>TODO: display transaction simulation result</DialogContentText>
          {/* <DialogContentText>arguments: </DialogContentText>
          {args.map((arg, index) => (
            <Box key={index}>{JSON.stringify(arg, null, 2)}</Box>
          ))} */}
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
