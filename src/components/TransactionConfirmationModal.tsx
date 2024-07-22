import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { transactionSelector } from "../store/transaction/transaction.selector"
import { transactionActions } from "../store/transaction/transaction.slice"
import { errorActions } from "../store/error/error.slice"

export const TransactionConfirmationModal: React.FC = () => {
  const { methodName, args, transaction, isVisible } = useSelector(transactionSelector.selectTransaction)
  const dispatch = useDispatch()

  const handleClose = async () => {
    dispatch(transactionActions.reject())
  }

  const submitTransaction = async () => {
    const { id, eventSource } = transaction
    if (!id || !eventSource || !methodName) {
      dispatch(errorActions.showError({ message: "Invalid transaction data" }))
      dispatch(transactionActions.reject())
      return
    }
    dispatch(
      transactionActions.submit({
        id,
        eventSource,
        methodName,
        args,
      })
    )
  }

  return (
    <Dialog open={isVisible} maxWidth="sm" fullWidth>
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
  )
}
