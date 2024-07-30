import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { transactionSelector } from "../store/transaction/transaction.selector"
import { transactionActions } from "../store/transaction/transaction.slice"
import { errorActions } from "../store/error/error.slice"
import { useTranslation } from "react-i18next"

export const TransactionConfirmationModal: React.FC = () => {
  const { t } = useTranslation(["components", "common"])
  const transaction = useSelector(transactionSelector.getPendingTransaction)
  const dispatch = useDispatch()

  const handleClose = async () => {
    if (!transaction) {
      dispatch(errorActions.showError({ message: "No pending transaction found" }))
      return
    }
    dispatch(transactionActions.cancelTransaction({ transaction }))
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
      <DialogTitle textAlign="center">{t("transaction-confirmation", { ns: "components" })}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("method-name", { methodName: transaction?.methodName, ns: "components" })}
        </DialogContentText>
        <DialogContentText>{t("todo-display-transaction-simulation-result", { ns: "components" })}</DialogContentText>
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
