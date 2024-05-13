import { useEffect, useState } from "react"
import { InstalledTapplet } from "../types/tapplet/Tapplet"
import { invoke } from "@tauri-apps/api/core"
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { Launch, Delete } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"
import { NavLink } from "react-router-dom"
import { TabKey } from "../views/Tabs"

interface InstalledTappletWithName {
  installed_tapplet: InstalledTapplet
  display_name: string
}

export const TappletsInstalled: React.FC = () => {
  const [installedTappletsList, setInstalledTappletsList] = useState<InstalledTappletWithName[]>([])

  useEffect(() => {
    const fetchTapplets = async () => {
      setInstalledTappletsList(await invoke("read_installed_tapp_db"))
    }

    fetchTapplets()
  }, [])

  const handleDelete = async (item: InstalledTappletWithName) => {
    const _id = item.installed_tapplet.id
    await invoke("delete_installed_tapp_db", { tappletId: _id })
    setInstalledTappletsList(await invoke("read_installed_tapp_db"))
  }

  return (
    <div>
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
              <IconButton aria-label="delete" style={{ marginRight: 10 }} onClick={() => handleDelete(item)}>
                <Delete color="primary" />
              </IconButton>
            </ListItem>
          ))}
      </List>
    </div>
  )
}
