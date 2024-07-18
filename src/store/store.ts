import { configureStore } from "@reduxjs/toolkit"
import { registeredTappletsReducer } from "./registeredTapplets/registeredTapplets.slice"
import { providerReducer } from "./provider/provider.slice"
import { listenerMiddleware } from "./store.listener"
import { errorReducer } from "./error/error.slice"
import { transactionConfirmationReducer } from "./transactionConfirmation/transactionConfirmation.slice"

export const store = configureStore({
  reducer: {
    registeredTapplets: registeredTappletsReducer,
    provider: providerReducer,
    error: errorReducer,
    transactionConfirmation: transactionConfirmationReducer,
  },

  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
