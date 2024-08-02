import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { errorStoreInitialState } from "./metadata.constants"
import { ChangeCurrentLanguagePayload } from "./metadata.types"

const metadataSlice = createSlice({
  name: "metadata",
  initialState: errorStoreInitialState,
  reducers: {
    changeCurrentLanguage: (state, action: PayloadAction<ChangeCurrentLanguagePayload>) => {
      state.currentLanguage = action.payload.language
    },
  },
})

export const metadataActions = metadataSlice.actions
export const metadataReducer = metadataSlice.reducer
