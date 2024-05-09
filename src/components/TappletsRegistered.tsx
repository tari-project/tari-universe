import { useEffect, useState } from "react"
import { InstalledTapplet, RegisteredTapplet } from "../types/tapplet/Tapplet"
import { invoke } from "@tauri-apps/api/core"
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { InstallDesktop } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"

export const TappletsRegistered: React.FC = () => {
  const [registeredTappletsList, setRegisteredTappletsList] = useState<RegisteredTapplet[]>([])

  useEffect(() => {
    const fetchTapplets = async () => {
      try {
        const _tapplets: RegisteredTapplet[] = await invoke("fetch_tapplets")
        if (_tapplets) setRegisteredTappletsList(_tapplets)
        console.log(_tapplets)
      } catch (error) {
        console.error("Error:", error)
      }
    }
    fetchTapplets()
  }, [])

  async function downloadAndExtract(url: string, path: string) {
    await invoke("download_tapp", { url, tappletPath: path })
    await invoke("extract_tapp_tarball", { tappletPath: path })
    await invoke("check_tapp_files", { tappletPath: path })
  }

  async function validateChecksum(path: string) {
    const calculatedChecksum: string = await invoke("calculate_tapp_checksum", {
      tappletPath: path,
    })
    //  TODO handle case if checksum is incorrect
    const isCheckumValid: boolean = await invoke("validate_tapp_checksum", {
      checksum: calculatedChecksum,
      tappletPath: path,
    })
  }

  async function installTapplet(url: string, path: string) {
    await downloadAndExtract(url, path)
    await validateChecksum(path)
  }

  const handleInstall = async (tapplet: RegisteredTapplet) => {
    //TODO fetch path & url from registry
    const basePath = "/home/oski/Projects/tari/tari-universe/tapplets_installed"
    const baseUrl = "https://registry.npmjs.org/tapp-example/-/tapp-example-1.0.0.tgz"
    await installTapplet(baseUrl, basePath)

    const tapp: InstalledTapplet = {
      is_dev_mode: true, //TODO
      dev_mode_endpoint: "",
      path_to_dist: "",
      tapplet_id: tapplet.id ?? 0,
    }
    invoke("insert_installed_tapp_db", { tapplet: tapp })
  }

  return (
    <div>
      {registeredTappletsList.length > 0 ? (
        <div>
          {registeredTappletsList.map((item) => (
            <List>
              <ListItem key={item.package_name}>
                <ListItemAvatar>
                  <Avatar src={tariLogo} />
                </ListItemAvatar>
                <ListItemText primary={item.package_name} />
                <IconButton aria-label="install">
                  <InstallDesktop onClick={() => handleInstall(item)} color="primary" />
                </IconButton>
              </ListItem>
            </List>
          ))}
        </div>
      ) : (
        <div>Registered tapplets list is empty</div>
      )}
    </div>
  )
}
