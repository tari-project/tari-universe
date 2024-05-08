import { useEffect, useState } from "react"
import { RegisteredTapplet } from "../types/tapplet/Tapplet"
import { invoke } from "@tauri-apps/api/core"
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { InstallDesktop, Launch } from "@mui/icons-material"
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

  const handleInstall = () => {
    console.log("eloszki")
  }

  return (
    <div>
      {registeredTappletsList.map((item) => (
        <List>
          <ListItem
            key={item.package_name}
            secondaryAction={
              // TODO this is just mvp- component refactor needed
              <IconButton aria-label="install" edge="start">
                <InstallDesktop onClick={handleInstall} color="primary" />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar src={tariLogo} />
            </ListItemAvatar>
            <ListItemText primary={item.package_name} />
          </ListItem>
        </List>
      ))}
    </div>
  )
}
