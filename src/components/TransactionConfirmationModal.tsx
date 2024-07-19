import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { transactionSelector } from "../store/transaction/transaction.selector"
import { transactionActions } from "../store/transaction/transaction.slice"

export const TransactionConfirmationModal: React.FC = () => {
  const { methodName, isVisible } = useSelector(transactionSelector.selectTransaction)
  const dispatch = useDispatch()

  const handleClose = async () => {
    console.log("handleClose")
    dispatch(transactionActions.hideDialog())
  }

  const submitTransaction = async () => {
    console.log("submitTransaction")
    dispatch(transactionActions.hideDialog())
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
