import { invoke } from "@tauri-apps/api/core"
import { useState } from "react"
import { TappletProps } from "./Tapplet"
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { NavLink } from "react-router-dom"
import { InstallDesktop, Launch } from "@mui/icons-material"
import { TappletListItemProps } from "./TappletsList"
import tariLogo from "../assets/tari.svg"
import { TabKey } from "../views/Tabs"
import { RegisteredTapplet } from "../types/tapplet/Tapplet"

export function TappletLauncher({ tappletId }: TappletProps) {
  const [installedTappletsList, setInstalledTappletsList] = useState<RegisteredTapplet[]>([])
  //TODO use Tauri BaseDir
  const basePath = "/home/oski/Projects/tari/tari-universe/tapplets_installed"

  const handleLaunch = () => {
    // invoke("read_installed_tapp_db", {})
    console.log("launch tapplet")
    readTappRegistryDb()
      .then((tapplets: RegisteredTapplet[]) => {
        setInstalledTappletsList(tapplets)
        console.log("Tapplets:", tapplets)
      })
      .catch((error: any) => {
        console.error("Error:", error)
      })
  }

  async function readTappRegistryDb(): Promise<RegisteredTapplet[]> {
    return await invoke("read_tapp_registry_db")
  }

  const item: TappletListItemProps = {
    name: "tst",
    icon: tariLogo,
    installed: false,
  }

  return (
    <div>
      <ListItem
        key={tappletId}
        secondaryAction={
          // TODO this is just mvp- component refactor needed

          <IconButton aria-label="install" edge="start">
            {/* <NavLink to={TabKey.ACTIVE_TAPPLET}> */}
            <Launch onClick={handleLaunch} color="primary" />
            {/* </NavLink> */}
          </IconButton>
        }
      >
        <ListItemAvatar>
          <Avatar src={item.icon} />
        </ListItemAvatar>
        <ListItemText primary={tappletId} />
      </ListItem>
      <ListItem>
        {installedTappletsList.map((item) => (
          <List>{item.display_name}</List>
        ))}
      </ListItem>
    </div>
  )
}
