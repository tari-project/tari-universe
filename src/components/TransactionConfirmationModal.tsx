import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { transactionSelector } from "../store/transaction/transaction.selector"
import { transactionActions } from "../store/transaction/transaction.slice"
import { errorActions } from "../store/error/error.slice"
import { simulationsSelectors } from "../store/simulation/simulation.selector"
import { RootState } from "../store/store"
import { useEffect } from "react"
import { simulationActions } from "../store/simulation/simulation.slice"
import { BalanceUpdateView } from "./BalanceUpdate"
import { useTranslation } from "react-i18next"
import { ErrorSource } from "../store/error/error.types"

const selectSimulationById = (state: RootState, id?: number) => (id ? simulationsSelectors.selectById(state, id) : null)

export const TransactionConfirmationModal: React.FC = () => {
  const { t } = useTranslation(["components", "common"])
  const transaction = useSelector(transactionSelector.getPendingTransaction)
  const simulation = useSelector((state: RootState) => selectSimulationById(state, transaction?.id))
  const dispatch = useDispatch()

  const handleClose = async () => {
    if (!transaction) {
      dispatch(errorActions.showError({ message: "no-pending-transaction-found", errorSource: ErrorSource.FRONTEND }))
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
      errorActions.showError({ message: "no-pending-transaction-found", errorSource: ErrorSource.FRONTEND })
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
      <DialogTitle textAlign="center">{t("transaction-confirmation", { ns: "components" })}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("method-name", { methodName: transaction?.methodName, ns: "components" })}
        </DialogContentText>
        <DialogContentText>
          {t("balance-updates", { ns: "components" })}:
          {simulation?.balanceUpdates?.map((update, index) => (
            <BalanceUpdateView key={index} {...update} />
          ))}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          {t("cancel", { ns: "common" })}
        </Button>
        <Button onClick={submitTransaction} variant="contained">
          {t("submit", { ns: "common" })}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
