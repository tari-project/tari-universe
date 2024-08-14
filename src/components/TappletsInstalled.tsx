import { useCallback } from "react"
import { Avatar, Box, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material"
import { Launch, Delete, Update } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"
import { NavLink } from "react-router-dom"
import { TabKey } from "../views/Tabs"
import { useDispatch, useSelector } from "react-redux"
import { devTappletsSelectors } from "../store/devTapplets/devTapplets.selector"
import { installedTappletsActions } from "../store/installedTapplets/installedTapplets.slice"
import { devTappletsActions } from "../store/devTapplets/devTapplets.slice"
import { DevTapplet, InstalledTappletWithName } from "@type/tapplet"
import { useTranslation } from "react-i18next"
import { installedTappletsListSelector } from "../store/installedTapplets/installedTapplets.selector"

export const TappletsInstalled: React.FC = () => {
  const { t } = useTranslation("components")
  const installedTapplets = useSelector(installedTappletsListSelector)
  const devTapplets = useSelector(devTappletsSelectors.selectAll)
  const dispatch = useDispatch()

  const updateInstalledTappletHandler = useCallback(
    (item: InstalledTappletWithName) => dispatch(installedTappletsActions.updateInstalledTappletRequest({ item })),
    [dispatch]
  )
  const deleteInstalledTappletHandler = useCallback(
    (tappletId: string) => dispatch(installedTappletsActions.deleteInstalledTappletRequest({ tappletId })),
    [dispatch]
  )
  const deleteDevTappletHandler = useCallback(
    (item: DevTapplet) => dispatch(devTappletsActions.deleteDevTappletRequest({ item })),
    [dispatch]
  )
  return (
    <Box marginX="auto" mt={4}>
      <Typography variant="h4" pt={6} textAlign="center">
        {t("installed-taplets")}
      </Typography>
      <List sx={{ width: "100%", minWidth: 500 }}>
        {installedTapplets.map((item, index) => (
          <ListItem key={index}>
            <ListItemAvatar>
              <Avatar src={item.logoAddr} />
            </ListItemAvatar>
            <ListItemText primary={item.display_name} />
            <IconButton aria-label="launch" style={{ marginRight: 10 }}>
              <NavLink to={`/${TabKey.ACTIVE_TAPPLET}/${item.installed_tapplet.id}`} style={{ display: "contents" }}>
                <Launch color="primary" />
              </NavLink>
            </IconButton>
            {item.installed_version !== item.latest_version && (
              <IconButton
                aria-label="update"
                style={{ marginRight: 10 }}
                onClick={() => updateInstalledTappletHandler(item)}
              >
                <Update color="primary" />
              </IconButton>
            )}
            <IconButton
              aria-label="delete"
              style={{ marginRight: 10 }}
              onClick={() => deleteInstalledTappletHandler(item.installed_tapplet.id)}
            >
              <Delete color="primary" />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Typography variant="h4" pt={6} textAlign="center">
        {t("dev-taplets")}
      </Typography>
      <List sx={{ maxWidth: 600 }}>
        {devTapplets.map((item, index) => (
          <ListItem key={index}>
            <ListItemAvatar>
              <Avatar src={tariLogo} />
            </ListItemAvatar>
            <ListItemText primary={item.display_name} />
            <IconButton aria-label="launch" style={{ marginRight: 10 }}>
              <NavLink to={`/${TabKey.DEV_TAPPLETS}/${item.id}`} state={item} style={{ display: "contents" }}>
                <Launch color="primary" />
              </NavLink>
            </IconButton>
            <IconButton aria-label="delete" style={{ marginRight: 10 }} onClick={() => deleteDevTappletHandler(item)}>
              <Delete color="primary" />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
