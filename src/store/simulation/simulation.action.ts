import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { simulationActions } from "./simulation.slice"
import { SimulationRequestPayload } from "./simulation.types"
import { RootState } from "../store"

export const runTransactionSimulationAction = () => ({
  actionCreator: simulationActions.runSimulationRequest,
  effect: async (
    action: PayloadAction<SimulationRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const { transactionId } = action.payload
    const state = listenerApi.getState() as RootState
    const provider = state.provider.provider
    const dispatch = listenerApi.dispatch
    const { runSimulation } = state.transaction.entities[transactionId]

    if (!provider) {
      dispatch(simulationActions.runSimulationFailure({ transactionId }))
      return
    }

    try {
      const balanceUpdates = await runSimulation()
      dispatch(simulationActions.runSimulationSuccess({ transactionId, balanceUpdates }))
    } catch (error) {
      dispatch(simulationActions.runSimulationFailure({ transactionId }))
    }
  },
})
