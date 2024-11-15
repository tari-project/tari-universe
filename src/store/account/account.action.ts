import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { accountActions } from "./account.slice"

import { errorActions } from "../error/error.slice"
import { RootState } from "../store"

import { ErrorSource } from "../error/error.types"
import { InitAccountRequestPayload, SetAccountRequestPayload } from "./account.types"

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
      const defaultAccount = await provider.client.accountsGetDefault({})

      listenerApi.dispatch(
        accountActions.setAccountSuccess({
          account: defaultAccount,
        })
      )
    } catch (error) {
      listenerApi.dispatch(accountActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})

export const setAccountAction = () => ({
  actionCreator: accountActions.setAccountRequest,
  effect: async (
    action: PayloadAction<SetAccountRequestPayload>,
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

      // if tapplet uses TU Provider it gets default account
      // this is to make sure tapplet uses the account selected by the user
      await provider.client.accountsSetDefault({
        account: {
          Name: action.payload.accountName,
        },
      })
      const account = await provider.client.accountsGet({
        name_or_address: { Name: action.payload.accountName },
      })

      listenerApi.dispatch(
        accountActions.setAccountSuccess({
          account,
        })
      )
    } catch (error) {
      listenerApi.dispatch(accountActions.setAccountFailure({ errorMsg: error as string }))
    }
  },
})
