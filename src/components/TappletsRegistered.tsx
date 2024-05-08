import { useEffect, useState } from "react"
import { InstalledTapplet, RegisteredTapplet } from "../types/tapplet/Tapplet"
import { invoke } from "@tauri-apps/api/core"
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { InstallDesktop } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"

export const TappletsRegistered: React.FC = () => {
  const [registeredTappletsList, setRegisteredTappletsList] = useState<RegisteredTapplet[]>([])
  //TODO use Tauri BaseDir
  useEffect(() => {
    const fetchTapplets = async () => {
      try {
        const registeredTapplets: RegisteredTapplet[] = await invoke("read_tapp_registry_db")
        setRegisteredTappletsList(registeredTapplets)
      } catch (error) {
        console.error("Error:", error)
      }
    }
    fetchTapplets()
  }, [])

  //TODO
  const handleInstall = (tapplet: RegisteredTapplet) => {
    const tapp: InstalledTapplet = {
      is_dev_mode: true,
      dev_mode_endpoint: "",
      path_to_dist: "",
      tapplet_id: 2,
    }
    invoke("insert_installed_tapp_db", { tapplet: tapp })
    invoke("read_installed_tapp_db", {})
  }

  return (
    <div>
      {registeredTappletsList.map((item) => (
        <List>
          <ListItem key={item.package_name}>
            <ListItemAvatar>
              <Avatar src={tariLogo} />
            </ListItemAvatar>
            <ListItemText primary={item.package_name} />
            <IconButton aria-label="install" style={{ margin: 10 }}>
              <InstallDesktop onClick={() => handleInstall(item)} color="primary" />
            </IconButton>
          </ListItem>
        </List>
      ))}
    </div>
  )
}
