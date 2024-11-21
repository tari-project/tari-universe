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
import { CallFunction, CallMethod } from "@tari-project/tarijs/dist/builders/types/Instruction"
import { resolveBackendErrorMessage } from "./ErrorSnackBar"
import { metadataSelector } from "../store/metadata/metadata.selector"

const selectSimulationById = (state: RootState, id?: number) => (id ? simulationsSelectors.selectById(state, id) : null)

export const TransactionConfirmationModal: React.FC = () => {
  const { t } = useTranslation(["components", "common"])
  const transaction = useSelector(transactionSelector.getPendingTransaction)
  const simulation = useSelector((state: RootState) => selectSimulationById(state, transaction?.id))
  const currentLanguage = useSelector(metadataSelector.selectCurrentLanguage)

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

  interface InstructionWithArgs {
    instructionName: string
    args: any[]
  }
  // Function to get function or method fields
  function getFunctionOrMethod(instructions: object[]): InstructionWithArgs[] {
    let functionNames: InstructionWithArgs[] = []
    instructions.forEach((instruction) => {
      // Check if the instruction is an object and not a string
      if (typeof instruction === "object" && instruction !== null) {
        if ("CallFunction" in instruction) {
          const callFunction = instruction as CallFunction
          functionNames.push({
            instructionName: callFunction.CallFunction.function,
            args: callFunction.CallFunction.args,
          })
        } else if ("CallMethod" in instruction) {
          const callMethod = instruction as CallMethod
          functionNames.push({ instructionName: callMethod.CallMethod.method, args: callMethod.CallMethod.args })
        }
      }
    })
    return functionNames
  }

  return (
    <Dialog open={!!transaction} maxWidth="sm" fullWidth>
      <DialogTitle textAlign="center">{t("transaction-confirmation", { ns: "components" })}:</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("method-name", { methodName: transaction?.methodName, ns: "components" })}
        </DialogContentText>
        {transaction?.args?.map((arg) => (
          <DialogContentText>
            {t("instructions", { ns: "components" })}:{" "}
            {getFunctionOrMethod(arg.instructions)
              .flatMap((i) => i.instructionName + " with args: " + i.args)
              .map((instruction, index) => (
                <div key={index}>{instruction}</div> // Using <div> or <span> to wrap each instruction
              ))}
          </DialogContentText>
        ))}
        <DialogContentText>
          {t("simulation-status", { ns: "components" })}: {simulation?.status}
        </DialogContentText>
        {simulation?.status == "failure" && (
          <DialogContentText>
            {t("simulation-error-msg", { ns: "components" })}:{" "}
            {resolveBackendErrorMessage(t, simulation?.errorMsg, currentLanguage)}
          </DialogContentText>
        )}
        <DialogContentText>
          {t("balance-updates", { ns: "components" })}:
          {Array.isArray(simulation?.balanceUpdates) && simulation.balanceUpdates.length > 0 ? (
            simulation.balanceUpdates.map((update) => <BalanceUpdateView key={update.vaultAddress} {...update} />)
          ) : (
            <span> No balance updates available.</span> // Optional: Provide feedback if there are no updates
          )}
        </DialogContentText>
        <DialogContentText>
          {t("tx-simulation-status", { ns: "components" })}: {simulation?.transaction?.status ?? "-"}
        </DialogContentText>
        <DialogContentText>
          {t("tx-simulation-error-msg", { ns: "components" })}: {simulation?.transaction?.errorMsg ?? "-"}
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
