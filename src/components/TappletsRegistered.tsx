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
import AddDevTappletDialog from "./AddDevTappletDialog"
import { useDispatch, useSelector } from "react-redux"
import { registeredTappletsSelectors } from "../store/registeredTapplets/registeredTapplets.selector"
import { registeredTappletsActions } from "../store/registeredTapplets/registeredTapplets.slice"
import { installedTappletsActions } from "../store/installedTapplets/installedTapplets.slice"
import { useTranslation } from "react-i18next"

export const TappletsRegistered: React.FC = () => {
  const { t } = useTranslation("components")
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
        {t("registered-taplets")}
      </Typography>
      {registeredTapplets.length ?? 0 > 0 ? (
        <List sx={{ width: "100%", minWidth: 500 }}>
          {registeredTapplets.map((item) => (
            <ListItem key={item.package_name} sx={{ paddingTop: 2 }}>
              <ListItemAvatar>
                <Avatar src={item.logoAddr} />
              </ListItemAvatar>
              <ListItemText primary={item.package_name} />
              <IconButton aria-label="install" onClick={() => handleInstall(item.id)} sx={{ marginLeft: 8 }}>
                <InstallDesktop color="primary" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography textAlign="center">{t("registered-taplets-list-empty")}</Typography>
      )}
      <Box pt={4} display="flex" justifyContent="center" gap={1}>
        <Button variant="contained" onClick={fetchTappletsFromRegistry}>
          {t("fetch-taplet-list")}
        </Button>
        <AddDevTappletDialog />
      </Box>
    </Box>
  )
}
