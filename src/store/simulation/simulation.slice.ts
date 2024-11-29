import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
  SimulationRequestPayload,
  SimulationSuccessPayload,
  Simulation,
  SimulationFailurePayload,
} from "./simulation.types"
import { listenerMiddleware } from "../store.listener"
import { runTransactionSimulationAction } from "./simulation.action"
import { TransactionStatus } from "@tari-project/tarijs"

export const simulationAdapter = createEntityAdapter({
  selectId: (simulation: Simulation) => simulation.transactionId,
  sortComparer: (a, b) => a.transactionId - b.transactionId,
})

const simulationSlice = createSlice({
  initialState: simulationAdapter.getInitialState(),
  name: "simulation",
  reducers: {
    runSimulationRequest: (state, action: PayloadAction<SimulationRequestPayload>) => {
      simulationAdapter.addOne(state, {
        transactionId: action.payload.transactionId,
        status: "pending",
        balanceUpdates: [],
        errorMsg: "",
        transaction: {
          status: TransactionStatus.DryRun,
          errorMsg: "",
        },
      })
    },
    runSimulationSuccess: (state, action: PayloadAction<SimulationSuccessPayload>) => {
      simulationAdapter.updateOne(state, {
        id: action.payload.transactionId,
        changes: {
          status: "success",
          balanceUpdates: action.payload.balanceUpdates,
          transaction: {
            errorMsg: action.payload.transaction.errorMsg,
            status: action.payload.transaction.status,
          },
        },
      })
    },
    runSimulationFailure: (state, action: PayloadAction<SimulationFailurePayload>) => {
      simulationAdapter.updateOne(state, {
        id: action.payload.transactionId,
        changes: {
          status: "failure",
          errorMsg: action.payload.errorMsg,
          transaction: {
            errorMsg: action.payload.transaction.errorMsg,
            status: action.payload.transaction.status,
          },
        },
      })
    },
  },
})

export const simulationActions = simulationSlice.actions
export const simulationReducer = simulationSlice.reducer

listenerMiddleware.startListening(runTransactionSimulationAction())
