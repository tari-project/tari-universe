import { useEffect, useState } from "react"
import { DevTapplet, InstalledTappletWithName } from "@type/tapplet"
import { invoke } from "@tauri-apps/api/core"
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material"
import { Launch, Delete } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"
import { NavLink } from "react-router-dom"
import { TabKey } from "../views/Tabs"

export const TappletsInstalled: React.FC = () => {
  const [installedTappletsList, setInstalledTappletsList] = useState<InstalledTappletWithName[]>([])
  const [devTappletsList, setDevTappletsList] = useState<DevTapplet[]>([])

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
    </div>
  )
}
