import { useEffect, useState } from "react"
import { InstalledTapplet, RegisteredTapplet, RegisteredTappletWithVersion } from "../types/tapplet/Tapplet"
import { invoke } from "@tauri-apps/api/core"
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { InstallDesktop } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"

export const TappletsRegistered: React.FC = () => {
  const [registeredTappletsList, setRegisteredTappletsList] = useState<RegisteredTapplet[]>([])

  useEffect(() => {
    const fetchTapplets = async () => {
      try {
        // fetch data from json to db
        await invoke("fetch_tapplets")
        // read from db
        const _tapplets: RegisteredTapplet[] = await invoke("read_tapp_registry_db")
        if (_tapplets) setRegisteredTappletsList(_tapplets)
      } catch (error) {
        console.error("Error:", error)
      }
    }
    fetchTapplets()
  }, [])

  async function downloadAndExtract(tappletId: number) {
    await invoke("download_and_extract_tapp", { tappletId: tappletId })
  }

  async function validateChecksum(tappletId: number) {
    //TODO use it to display the verification process status
    const isCheckumValid: boolean = await invoke("calculate_and_validate_tapp_checksum", {
      tappletId: tappletId,
    })
    console.log("is checksum valid?", isCheckumValid)
  }

  async function installTapplet(tappletId: number) {
    await downloadAndExtract(tappletId)
    await validateChecksum(tappletId)
  }

  const handleInstall = async (tapplet: RegisteredTapplet) => {
    if (!tapplet.id) return
    await installTapplet(tapplet.id)

    // TODO insert to db
    const tapp: InstalledTapplet = {
      is_dev_mode: true, //TODO dev mode
      dev_mode_endpoint: "",
      path_to_dist: "path_to_dist",
      tapplet_id: tapplet.id,
      tapplet_version_id: 1,
    }

    invoke("insert_installed_tapp_db", { tapplet: tapp })
  }

  return (
    <div>
      {registeredTappletsList.length > 0 ? (
        <List>
          {registeredTappletsList.map((item) => (
            <ListItem key={item.package_name}>
              <ListItemAvatar>
                <Avatar src={tariLogo} />
              </ListItemAvatar>
              <ListItemText primary={item.package_name} />
              <IconButton aria-label="install" onClick={() => handleInstall(item)}>
                <InstallDesktop color="primary" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <div>Registered tapplets list is empty</div>
      )}
    </div>
  )
}
