import { useCallback, useEffect, useState } from "react"
import { DevTapplet, InstalledTappletWithName } from "@type/tapplet"
import { invoke } from "@tauri-apps/api/core"
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material"
import { Launch, Delete } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"
import { NavLink } from "react-router-dom"
import { TabKey } from "../views/Tabs"
import { useSnackBar } from "../ErrorContext"

const useInstalledTapplets = () => {
  const [installedTappletsList, setInstalledTappletsList] = useState<InstalledTappletWithName[] | undefined>([])
  const { showSnackBar } = useSnackBar()

  useEffect(() => {
    const fetchTapplets = async () => {
      try {
        const installedTappletsList = await invoke("read_installed_tapp_db")
        setInstalledTappletsList(installedTappletsList as InstalledTappletWithName[] | undefined)
      } catch (error) {
        showSnackBar(error, "error")
      }
    }

    fetchTapplets()
  }, [])

  const deleteInstalledTapplet = useCallback(async (item: InstalledTappletWithName) => {
    const _id = item.installed_tapplet.id
    try {
      await invoke("delete_installed_tapp", { tappletId: _id })
      await invoke("delete_installed_tapp_db", { tappletId: _id })

      const installedTappletsList = await invoke("read_installed_tapp_db")
      setInstalledTappletsList(installedTappletsList as InstalledTappletWithName[] | undefined)
    } catch (error) {
      showSnackBar(error, "error")
    }
  }, [])

  return { installedTappletsList, deleteInstalledTapplet }
}

const useDevTapplets = () => {
  const [devTappletsList, setDevTappletsList] = useState<DevTapplet[] | undefined>([])
  const { showSnackBar } = useSnackBar()

  useEffect(() => {
    const fetchTapplets = async () => {
      try {
        const devTappletsList = await invoke("read_dev_tapplets")
        setDevTappletsList(devTappletsList as DevTapplet[] | undefined)
      } catch (error) {
        showSnackBar(error, "error")
      }
    }

    fetchTapplets()
  }, [])

  const deleteDevTapplet = useCallback(async (item: DevTapplet) => {
    try {
      const _id = item.id
      await invoke("delete_dev_tapp", { tappletId: _id })
      await invoke("delete_dev_tapp_db", { tappletId: _id })

      const devTappletsList = await invoke("read_dev_tapplets")
      setDevTappletsList(devTappletsList as DevTapplet[] | undefined)
    } catch (error) {
      showSnackBar(error, "error")
    }
  }, [])

  return { devTappletsList, deleteDevTapplet }
}

export const TappletsInstalled: React.FC = () => {
  const { installedTappletsList, deleteInstalledTapplet } = useInstalledTapplets()
  const { devTappletsList, deleteDevTapplet } = useDevTapplets()

  return (
    <div>
      <Typography variant="h4">Installed Tapplets</Typography>
      <List>
        {installedTappletsList &&
          installedTappletsList.map((item, index) => (
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
              <IconButton aria-label="delete" style={{ marginRight: 10 }} onClick={() => deleteInstalledTapplet(item)}>
                <Delete color="primary" />
              </IconButton>
            </ListItem>
          ))}
      </List>
      <Typography variant="h4">Dev Tapplets</Typography>
      <List>
        {devTappletsList &&
          devTappletsList.map((item, index) => (
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
              <IconButton aria-label="delete" style={{ marginRight: 10 }} onClick={() => deleteDevTapplet(item)}>
                <Delete color="primary" />
              </IconButton>
            </ListItem>
          ))}
      </List>
    </div>
  )
}
