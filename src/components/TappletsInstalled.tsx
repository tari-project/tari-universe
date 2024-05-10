import { useEffect, useState } from "react"
import { InstalledTapplet, RegisteredTapplet } from "../types/tapplet/Tapplet"
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
        // TODO refactor db to store tapplet name and siplay it on the list
        if (_tapplets) setInstalledTappletsList(_tapplets)
        console.log("TAPPLET INSTALLED LIST UPDATED")
        console.log(_tapplets)
      } catch (error) {
        console.error("Error:", error)
      }
    }
    fetchTapplets()
  }, [])

  //TODO refactor if 'active tapplet' component is done
  const handleLaunch = async (item: InstalledTapplet) => {
    console.log("=>>>", item.tapplet_id)
    const _id = item.tapplet_id ?? 1
    const tap: RegisteredTapplet = await invoke("get_by_id_tapp_registry_db", { tappletId: _id })
    console.log("=>>>", tap.display_name)
  }

  const handleDelete = async (item: InstalledTapplet) => {
    console.log("delete tapplet")
    console.log("=>>>", item.tapplet_id)
    const _id = item.id ?? 1
    //TODO delete single tapplet by given id
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
              <ListItemText primary={item.tapplet_id} />
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
