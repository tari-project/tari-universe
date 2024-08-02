import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { transactionSelector } from "../store/transaction/transaction.selector"
import { transactionActions } from "../store/transaction/transaction.slice"
import { errorActions } from "../store/error/error.slice"
import { simulationsSelectors } from "../store/simulation/simulation.selector"
import { RootState } from "../store/store"
import { useEffect } from "react"
import { simulationActions } from "../store/simulation/simulation.slice"

const selectSimulationById = (state: RootState, id?: number) => (id ? simulationsSelectors.selectById(state, id) : null)

export const TransactionConfirmationModal: React.FC = () => {
  const transaction = useSelector(transactionSelector.getPendingTransaction)
  const simulation = useSelector((state: RootState) => selectSimulationById(state, transaction?.id))
  const dispatch = useDispatch()

  const handleClose = async () => {
    if (!transaction) {
      dispatch(errorActions.showError({ message: "No pending transaction found" }))
      return
    }
    dispatch(transactionActions.cancelTransaction({ transaction }))
  }

  useEffect(() => {
    if (transaction?.id) {
      dispatch(simulationActions.runSimulationRequest({ transactionId: transaction?.id }))
    }
  }, [transaction])

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
        <DialogContentText>
          Balance updates:
          {simulation?.balanceUpdates?.map((update, index) => (
            <span key={index}>{JSON.stringify(update, null, 2)}</span>
          ))}
        </DialogContentText>
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
