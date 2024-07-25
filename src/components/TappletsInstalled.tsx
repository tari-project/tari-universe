import { Avatar, Box, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material"
import { Launch, Delete } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"
import { NavLink } from "react-router-dom"
import { TabKey } from "../views/Tabs"
import { useDispatch, useSelector } from "react-redux"
import { installedTappletsSelectors } from "../store/installedTapplets/installedTapplets.selector"
import { devTappletsSelectors } from "../store/devTapplets/devTapplets.selector"
import { installedTappletsActions } from "../store/installedTapplets/installedTapplets.slice"
import { devTappletsActions } from "../store/devTapplets/devTapplets.slice"

export const TappletsInstalled: React.FC = () => {
  const installedTapplets = useSelector(installedTappletsSelectors.selectAll)
  const devTapplets = useSelector(devTappletsSelectors.selectAll)
  const dispatch = useDispatch()

  return (
    <Box marginX="auto" mt={4}>
      <Typography variant="h4" pt={6} textAlign="center">
        Installed Tapplets
      </Typography>
      <List sx={{ width: "100%", minWidth: 500 }}>
        {installedTapplets.map((item, index) => (
          <ListItem key={index}>
            <ListItemAvatar>
              <Avatar src={tariLogo} />
            </ListItemAvatar>
            <ListItemText primary={item.display_name} />
            <IconButton aria-label="launch" style={{ marginRight: 10 }}>
              <NavLink to={`/${TabKey.ACTIVE_TAPPLET}/${item.installed_tapplet.id}`} style={{ display: "contents" }}>
                <Launch color="primary" />
              </NavLink>
            </IconButton>
            <IconButton
              aria-label="delete"
              style={{ marginRight: 10 }}
              onClick={() => dispatch(installedTappletsActions.deleteInstalledTappletRequest({ item }))}
            >
              <Delete color="primary" />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Typography variant="h4" pt={6} textAlign="center">
        Dev Tapplets
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
            <IconButton
              aria-label="delete"
              style={{ marginRight: 10 }}
              onClick={() => dispatch(devTappletsActions.deleteDevTappletRequest({ item }))}
            >
              <Delete color="primary" />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
