import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { accountActions } from "./account.slice"

import { errorActions } from "../error/error.slice"
import { RootState } from "../store"

import { ErrorSource } from "../error/error.types"
import { InitAccountRequestPayload } from "./account.types"

export const initializeAction = () => ({
  actionCreator: accountActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitAccountRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      const dispatch = listenerApi.dispatch
      const state = listenerApi.getState() as RootState
      const provider = state.provider.provider

      if (!provider) {
        dispatch(errorActions.showError({ message: "failed-to-find-provider", errorSource: ErrorSource.FRONTEND }))
        return
      }
      const defaultAccount = await provider.selectAccount()

      listenerApi.dispatch(
        accountActions.changeCurrentAccount({
          account: {
            account: {
              name: defaultAccount.address,
              address: defaultAccount.address as any,
              key_index: defaultAccount.account_id,
              is_default: true,
            },
            public_key: defaultAccount.public_key,
          },
        })
      )
    } catch (error) {
      listenerApi.dispatch(accountActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})
