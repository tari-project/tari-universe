import { RootState } from "../store/store"
import { tappletProviderSelector } from "../store/tappletProviders/tappletProviders.selector"

export const selectTappProviderById = (state: RootState, id?: string) =>
  id ? tappletProviderSelector.getTappletProviderById(state, id) : null

export type TappProviderIdParam = {
  installedTappletId?: number | string
  devTappletId?: number | string
}
export const getTappProviderId = (tappId: TappProviderIdParam): string => {
  if (tappId.devTappletId) return `DTP${tappId.devTappletId}`
  if (tappId.installedTappletId) return `TP${tappId.installedTappletId}`
  return ""
}
