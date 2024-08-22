import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { installedTappletAdapter } from "./installedTapplets.slice"
import { registeredTappletsSelectors } from "../registeredTapplets/registeredTapplets.selector"

const installedTappletsStateSelector = (state: RootState) => state.installedTapplets
export const installedTappletsSelectors = installedTappletAdapter.getSelectors<RootState>(
  (state) => state.installedTapplets.installedTapplets
)

export const installedTappletsListSelector = createSelector(
  [installedTappletsSelectors.selectAll, registeredTappletsSelectors.selectAll],
  (installedTapplets, registeredTapplets) => {
    return installedTapplets.map((installedTapplet) => {
      const registeredTapplet = registeredTapplets.find(
        (tapplet) => tapplet.id === installedTapplet.installed_tapplet.tapplet_id
      )
      return { ...installedTapplet, ...registeredTapplet }
    })
  }
)

const isInitialized = createSelector([installedTappletsStateSelector], (state) => state.isInitialized)

export const installedTappletsSelector = {
  isInitialized,
}
