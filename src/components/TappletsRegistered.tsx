import { useEffect, useState } from "react"
import { InstalledTapplet, RegisteredTapplet } from "../types/tapplet/Tapplet"
import { invoke } from "@tauri-apps/api/core"
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { InstallDesktop } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"

interface RegisteredTappletWithVersion {
  registered_tapplet: RegisteredTapplet
  version: string
  integrity: string
  registry_url: string
}

interface TappletVersion {
  id?: number
  tapplet_id?: number
  version: string
  integrity: string
  registry_url: string
}

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
    //TODO add separate folder for different version
    //TODO set url for different versions - registry json refactor needed
    const _tapplet: RegisteredTappletWithVersion = await invoke("get_registered_tapp_with_version", {
      tappletId: tapplet.id,
    })
    const baseUrl = `${_tapplet.registry_url}`
    const basePath = `../tapplets_installed/${_tapplet.registered_tapplet.registry_id}/${_tapplet.version}`
    await installTapplet(baseUrl, basePath)

    const tapp: InstalledTapplet = {
      is_dev_mode: true, //TODO dev mode
      dev_mode_endpoint: "",
      path_to_dist: "",
      tapplet_id: tapplet.id ?? 0,
      tapplet_version_id: tapplet.id,
    }

    invoke("insert_installed_tapp_db", { tapplet: tapp })
    console.log("dupa", _tapplet)
    console.log("dupa", _tapplet.registered_tapplet, _tapplet.registry_url)
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
