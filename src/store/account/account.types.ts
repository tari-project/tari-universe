import { AccountInfo } from "@tari-project/typescript-bindings"

export type AccountStoreState = {
  isInitialized: boolean
  account: AccountInfo | null
}

export type InitAccountRequestPayload = {}
export type InitAccountFailurePayload = {
  errorMsg: string
}
export type InitAccountSuccessPayload = {
  account: AccountInfo
}

export type SetAccountRequestPayload = {
  accountName: string
}
export type SetAccountSuccessPayload = {
  account: AccountInfo
}
export type SetAccountFailurePayload = {
  errorMsg: string
}
