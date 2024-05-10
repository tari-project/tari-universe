import { useEffect, useState } from "react"
import { InstalledTapplet, RegisteredTapplet } from "../types/tapplet/Tapplet"
import { invoke } from "@tauri-apps/api/core"
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { Launch, Delete } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"

interface InstalledTappletWithName {
  tapplet: InstalledTapplet
  tappletName: string
}

export const TappletsInstalled: React.FC = () => {
  const [installedTappletsList, setInstalledTappletsList] = useState<InstalledTappletWithName[]>([])

  useEffect(() => {
    const fetchTapplets = async () => {
      try {
        const response: [InstalledTapplet, string][] = await invoke("read_installed_tapp_db")
        // map response because of type errors
        const _tapplets: InstalledTappletWithName[] = response.map(([tapp, tappName]) => {
          return { tapplet: tapp, tappletName: tappName }
        })
        if (Array.isArray(_tapplets)) {
          setInstalledTappletsList(_tapplets)
        } else {
          console.warn("Expected an array of Installed Tapplets, but received:", response)
        }
      } catch (error) {
        console.error("Error:", error)
      }
    }

    fetchTapplets()
  }, [])

  //TODO refactor if 'active tapplet' component is done
  const handleLaunch = async (item: InstalledTappletWithName) => {
    console.log(item.tappletName)
  }

  const handleDelete = async (item: InstalledTappletWithName) => {
    const _id = item.tapplet.id
    await invoke("delete_installed_tapp_db", { tappletId: _id })
    // TODO refresh the list
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
              <ListItemText primary={item.tappletName} />
              <IconButton aria-label="launch" style={{ marginRight: 10 }}>
                {/* <NavLink to={TabKey.ACTIVE_TAPPLET} style={{ display: "contents" }}> */}
                <Launch onClick={() => handleLaunch(item)} color="primary" />
                {/* </NavLink> */}
              </IconButton>
              <IconButton aria-label="delete" style={{ marginRight: 10 }}>
                <Delete onClick={() => handleDelete(item)} color="primary" />
              </IconButton>
            </ListItem>
          </List>
        ))}
    </div>
  )
}
