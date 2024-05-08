import { useEffect, useState } from "react"
import { InstalledTapplet } from "../types/tapplet/Tapplet"
import { invoke } from "@tauri-apps/api/core"
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { Launch, Delete } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"
import { NavLink } from "react-router-dom"
import { TabKey } from "../views/Tabs"

const tst: InstalledTapplet[] = [
  {
    dev_mode_endpoint: "",
    is_dev_mode: true,
    path_to_dist: "",
    tapplet_id: 0,
  },
]

export const TappletsInstalled: React.FC = () => {
  const [installedTappletsList, setInstalledTappletsList] = useState<InstalledTapplet[]>(tst)
  //TODO use Tauri BaseDir
  useEffect(() => {
    const fetchTapplets = async () => {
      try {
        const _tapplets: InstalledTapplet[] = await invoke("read_installed_tapp_db")
        if (_tapplets && _tapplets.length > 0) setInstalledTappletsList(_tapplets)
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
      {installedTappletsList.map((item) => (
        <List>
          <ListItem key={item.tapplet_id}>
            <ListItemAvatar>
              <Avatar src={tariLogo} />
            </ListItemAvatar>
            <ListItemText primary={item.tapplet_id} />
            <IconButton aria-label="launch" style={{ margin: 10 }}>
              <NavLink to={TabKey.ACTIVE_TAPPLET}>
                <Launch onClick={handleLaunch} color="primary" />
              </NavLink>
            </IconButton>
            <IconButton aria-label="delete" style={{ margin: 10 }}>
              <Delete onClick={handleDelete} color="primary" />
            </IconButton>
          </ListItem>
        </List>
      ))}
    </div>
  )
}
