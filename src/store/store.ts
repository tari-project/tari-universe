import { configureStore } from "@reduxjs/toolkit"
import { registeredTappletsReducer } from "./registeredTapplets/registeredTapplets.slice"
import { providerReducer } from "./provider/provider.slice"
import { listenerMiddleware } from "./store.listener"
import { errorReducer } from "./error/error.slice"
import { transactionReducer } from "./transaction/transaction.slice"
import { installedTappletsReducer } from "./installedTapplets/installedTapplets.slice"
import { devTappletsReducer } from "./devTapplets/devTapplets.slice"

export const store = configureStore({
  reducer: {
    registeredTapplets: registeredTappletsReducer,
    installedTapplets: installedTappletsReducer,
    devTapplets: devTappletsReducer,
    provider: providerReducer,
    error: errorReducer,
    transaction: transactionReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).prepend(listenerMiddleware.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
