import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { simulationActions } from "./simulation.slice"
import { SimulationRequestPayload } from "./simulation.types"
import { RootState } from "../store"
import { TransactionStatus } from "@tari-project/tarijs"

export const runTransactionSimulationAction = () => ({
  actionCreator: simulationActions.runSimulationRequest,
  effect: async (
    action: PayloadAction<SimulationRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const { transactionId } = action.payload
    const state = listenerApi.getState() as RootState
    const provider = state.provider.provider //TODO use tapplet provider not TUInternal
    const dispatch = listenerApi.dispatch
    console.log("[store simulation] tx id", action.payload.transactionId)

    const { runSimulation } = state.transaction.entities[transactionId]

    if (!provider) {
      dispatch(
        simulationActions.runSimulationFailure({
          transactionId,
          errorMsg: "Provider not found",
          transaction: { status: TransactionStatus.InvalidTransaction, errorMsg: "Provider not found" },
        })
      )
      return
    }

    try {
      const simulationResult = await runSimulation()
      dispatch(
        simulationActions.runSimulationSuccess({
          transactionId,
          balanceUpdates: simulationResult.balanceUpdates,
          transaction: simulationResult.txSimulation,
        })
      )
    } catch (error) {
      console.error(error)
      dispatch(
        simulationActions.runSimulationFailure({
          transactionId,
          errorMsg: String(error),
          transaction: { status: TransactionStatus.Rejected, errorMsg: String(error) },
        })
      )
    }
  },
})
