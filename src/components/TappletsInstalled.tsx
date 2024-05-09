import { useEffect, useState } from "react"
import { InstalledTapplet } from "../types/tapplet/Tapplet"
import { invoke } from "@tauri-apps/api/core"
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { Launch, Delete } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"
import { NavLink } from "react-router-dom"
import { TabKey } from "../views/Tabs"

export const TappletsInstalled: React.FC = () => {
  const [installedTappletsList, setInstalledTappletsList] = useState<InstalledTapplet[]>([])
  //TODO use Tauri BaseDir
  useEffect(() => {
    const fetchTapplets = async () => {
      try {
        const _tapplets: InstalledTapplet[] = await invoke("read_installed_tapp_db")
        if (_tapplets) setInstalledTappletsList(_tapplets)
        console.log("TAPPLET INSTALLED LIST UPDATED")
        console.log(_tapplets)
      } catch (error) {
        console.error("Error:", error)
      }
    }
    fetchTapplets()
  }, [])

  const handleLaunch = () => {
    console.log("launch eloszki")
  }

  const handleDelete = () => {
    console.log("delete  eloszki")
  }

  return (
    <div>
      {installedTappletsList &&
        installedTappletsList.map((item, index) => (
          <List>
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar src={tariLogo} />
              </ListItemAvatar>
              <ListItemText primary={item.tapplet_id} />
              <IconButton aria-label="launch" style={{ marginRight: 10 }}>
                <NavLink to={TabKey.ACTIVE_TAPPLET} style={{ display: "contents" }}>
                  <Launch onClick={handleLaunch} color="primary" />
                </NavLink>
              </IconButton>
              <IconButton aria-label="delete" style={{ marginRight: 10 }}>
                <Delete onClick={handleDelete} color="primary" />
              </IconButton>
            </ListItem>
          </List>
        ))}
    </div>
  )
}
