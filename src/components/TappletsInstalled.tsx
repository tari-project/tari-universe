import { useEffect, useState } from "react"
import { InstalledTapplet } from "../types/tapplet/Tapplet"
import { invoke } from "@tauri-apps/api/core"
import {
  Avatar,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material"
import { Launch, Delete, Add } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"
import { NavLink } from "react-router-dom"
import { TabKey } from "../views/Tabs"

interface InstalledTappletWithName {
  installed_tapplet: InstalledTapplet
  display_name: string
}

export interface DevTapplet {
  id?: number
  package_name: string
  endpoint: string
  tapplet_name: string
  display_name: string
  about_summary: string
  about_description: string
}

export const TappletsInstalled: React.FC = () => {
  const [installedTappletsList, setInstalledTappletsList] = useState<InstalledTappletWithName[]>([])
  const [devTappletsList, setDevTappletsList] = useState<DevTapplet[]>([])
  const [tappletDevModeEndpoint, setTappletDevModeEndpoint] = useState<string>("")

  useEffect(() => {
    const fetchTapplets = async () => {
      setInstalledTappletsList(await invoke("read_installed_tapp_db"))
      setDevTappletsList(await invoke("read_dev_tapplets"))
    }

    fetchTapplets()
  }, [])

  const handleDeleteInstalledTapplet = async (item: InstalledTappletWithName) => {
    const _id = item.installed_tapplet.id
    await invoke("delete_installed_tapp", { tappletId: _id })
    await invoke("delete_installed_tapp_db", { tappletId: _id })
    setInstalledTappletsList(await invoke("read_installed_tapp_db"))
  }

  const handleAddTappletDevMode = async (endpoint: string) => {
    await invoke("add_dev_tapplet", { endpoint })
    setDevTappletsList(await invoke("read_dev_tapplets"))
  }

  const handleDeleteDevTapplet = async (item: DevTapplet) => {
    await invoke("delete_dev_tapplet", { devTappletId: item.id })
    setDevTappletsList(await invoke("read_dev_tapplets"))
  }

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
              <IconButton
                aria-label="delete"
                style={{ marginRight: 10 }}
                onClick={() => handleDeleteInstalledTapplet(item)}
              >
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
              <IconButton aria-label="delete" style={{ marginRight: 10 }} onClick={() => handleDeleteDevTapplet(item)}>
                <Delete color="primary" />
              </IconButton>
            </ListItem>
          ))}
      </List>
      <TextField
        label="Tapplet dev mode endpoint"
        value={tappletDevModeEndpoint}
        onChange={(e) => setTappletDevModeEndpoint(e.target.value)}
      />
      <Button onClick={() => handleAddTappletDevMode(tappletDevModeEndpoint)} variant="contained" startIcon={<Add />}>
        Add tapplet in the dev mode
      </Button>
    </div>
  )
}
