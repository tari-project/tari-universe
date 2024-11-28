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
    console.log("[store simulation] tx id", action.payload.transactionId)

    const { runSimulation } = state.transaction.entities[transactionId]

    if (!provider) {
      dispatch(simulationActions.runSimulationFailure({ transactionId, errorMsg: "Provider not found" }))
      return
    }

    try {
      console.log("[store simulation] try run sim")
      const balanceUpdates = await runSimulation()
      console.log("[store simulation] try run sim ok", balanceUpdates)
      dispatch(simulationActions.runSimulationSuccess({ transactionId, balanceUpdates }))
    } catch (error) {
      console.error(error)
      dispatch(simulationActions.runSimulationFailure({ transactionId, errorMsg: String(error) }))
    }
  },
})
