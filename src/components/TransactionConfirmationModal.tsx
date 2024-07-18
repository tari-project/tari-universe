import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { transactionConfirmationSelector } from "../store/transactionConfirmation/transactionConfirmation.selector"
import { transactionConfirmationActions } from "../store/transactionConfirmation/transactionConfirmation.slice"

export const TransactionConfirmationProvider: React.FC = () => {
  const { message, isVisible } = useSelector(transactionConfirmationSelector.selectTransactionConfirmation)
  const dispatch = useDispatch()

  const handleClose = async () => {
    dispatch(transactionConfirmationActions.hideDialog())
  }

  const submitTransaction = async () => {
    dispatch(transactionConfirmationActions.hideDialog())
  }

  return (
    <Dialog open={isVisible} maxWidth="sm" fullWidth>
      <DialogTitle textAlign="center">Transaction confirmation</DialogTitle>
      <DialogContent>
        <DialogContentText>Method name: {message}</DialogContentText>
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
