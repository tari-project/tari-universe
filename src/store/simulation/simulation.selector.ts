import { RootState } from "../store"
import { simulationAdapter } from "./simulation.slice"

const selectSimulationState = (state: RootState) => state.simulation
export const simulationsSelectors = simulationAdapter.getSelectors<RootState>(selectSimulationState)
