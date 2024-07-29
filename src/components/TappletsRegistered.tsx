import {
  Avatar,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material"
import { InstallDesktop } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"
import AddDevTappletDialog from "./AddDevTappletDialog"
import { useDispatch, useSelector } from "react-redux"
import { registeredTappletsSelectors } from "../store/registeredTapplets/registeredTapplets.selector"
import { registeredTappletsActions } from "../store/registeredTapplets/registeredTapplets.slice"
import { installedTappletsActions } from "../store/installedTapplets/installedTapplets.slice"

export const TappletsRegistered: React.FC = () => {
  const registeredTapplets = useSelector(registeredTappletsSelectors.selectAll)
  const dispatch = useDispatch()

  const handleInstall = async (tappletId: string) => {
    dispatch(installedTappletsActions.addInstalledTappletRequest({ tappletId }))
  }

  const fetchTappletsFromRegistry = async () => {
    dispatch(registeredTappletsActions.initializeRequest({}))
    dispatch(installedTappletsActions.initializeRequest({}))
  }

  return (
    <Box marginX="auto" mt={4}>
      <Typography variant="h4" textAlign="center" pt={6}>
        Registered Tapplets
      </Typography>
      {registeredTapplets.length ?? 0 > 0 ? (
        <List sx={{ width: "100%", minWidth: 500 }}>
          {registeredTapplets.map((item) => (
            <ListItem key={item.package_name} sx={{ paddingTop: 2 }}>
              <ListItemAvatar>
                <Avatar src={tariLogo} />
              </ListItemAvatar>
              <ListItemText primary={item.package_name} />
              <IconButton aria-label="install" onClick={() => handleInstall(item.id)} sx={{ marginLeft: 8 }}>
                <InstallDesktop color="primary" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography textAlign="center">Registered tapplets list is empty</Typography>
      )}
      <Box pt={4} display="flex" justifyContent="center" gap={1}>
        <Button variant="contained" onClick={fetchTappletsFromRegistry}>
          Fetch Tapplet List
        </Button>
        <AddDevTappletDialog />
      </Box>
    </Box>
  )
}
