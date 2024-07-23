import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { transactionSelector } from "../store/transaction/transaction.selector"
import { transactionActions } from "../store/transaction/transaction.slice"
import { errorActions } from "../store/error/error.slice"

export const TransactionConfirmationModal: React.FC = () => {
  const transaction = useSelector(transactionSelector.getPendingTransaction)
  const dispatch = useDispatch()

  const handleClose = async () => {
    if (!transaction) {
      dispatch(errorActions.showError({ message: "No pending transaction found" }))
      return
    }
    dispatch(transactionActions.cancelTransaction({ id: transaction.id }))
  }

  const submitTransaction = async () => {
    if (!transaction) {
      dispatch(errorActions.showError({ message: "No pending transaction found" }))
      return
    }
    dispatch(
      transactionActions.sendTransactionRequest({
        transaction,
      })
    )
  }

  return (
    <Dialog open={!!transaction} maxWidth="sm" fullWidth>
      <DialogTitle textAlign="center">Transaction confirmation</DialogTitle>
      <DialogContent>
        <DialogContentText>Method name: {transaction?.methodName}</DialogContentText>
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
