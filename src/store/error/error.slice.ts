import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { errorStoreInitialState } from "./error.constants"
import { ShowErrorPayload } from "./error.types"

const errorSlice = createSlice({
  name: "error",
  initialState: errorStoreInitialState,
  reducers: {
    showError: (state, action: PayloadAction<ShowErrorPayload>) => {
      state.message = action.payload.message
      state.isVisible = true
    },
    hideError: (state) => {
      state.message = ""
      state.isVisible = false
    },
  },
})

export const errorActions = errorSlice.actions
export const errorReducer = errorSlice.reducer
