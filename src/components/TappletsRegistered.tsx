import { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material"
import { InstallDesktop } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"
import AddDevTappletDialog from "./AddDevTappletDialog"
import { RegisteredTapplet } from "@type/tapplet"
import { useSnackBar } from "../ErrorContext"

export const TappletsRegistered: React.FC = () => {
  const [registeredTappletsList, setRegisteredTappletsList] = useState<RegisteredTapplet[]>([])
  const { showSnackBar } = useSnackBar()

  useEffect(() => {
    const fetchTapplets = async () => {
      try {
        // fetch data from json to db
        await invoke("fetch_tapplets")
          .then((message) => console.log(message))
          .catch((error) => showSnackBar(error, "error"))
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

  const handleInstall = async (tappletId?: number) => {
    if (!tappletId) return
    await installTapplet(tappletId)

    invoke("insert_installed_tapp_db", { tappletId: tappletId })
  }

  return (
    <div>
      <Typography variant="h4">Registered Tapplets</Typography>
      {registeredTappletsList.length > 0 ? (
        <List>
          {registeredTappletsList.map((item) => (
            <ListItem key={item.package_name}>
              <ListItemAvatar>
                <Avatar src={tariLogo} />
              </ListItemAvatar>
              <ListItemText primary={item.package_name} />
              <IconButton aria-label="install" onClick={() => handleInstall(item.id)}>
                <InstallDesktop color="primary" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <div>Registered tapplets list is empty</div>
      )}
      <AddDevTappletDialog />
    </div>
  )
}
