import { useCallback, useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import {
  Avatar,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material"
import { InstallDesktop } from "@mui/icons-material"
import tariLogo from "../assets/tari.svg"
import AddDevTappletDialog from "./AddDevTappletDialog"
import { RegisteredTapplet } from "@type/tapplet"
import { useSnackBar } from "../ErrorContext"

const useRegisteredTapplets = () => {
  const [tapplets, setTapplets] = useState<RegisteredTapplet[]>([])
  const { showSnackBar } = useSnackBar()

  useEffect(() => {
    const fetchTappletsFromDb = async () => {
      try {
        const tapplets = await invoke("read_tapp_registry_db")
        setTapplets((tapplets as RegisteredTapplet[]) || [])
      } catch (error) {
        showSnackBar(error, "error")
      }
    }

    fetchTappletsFromDb()
  }, [])

  const fetchTappletsFromRegistry = useCallback(() => invoke("fetch_tapplets"), [])

  return [tapplets, fetchTappletsFromRegistry] as [RegisteredTapplet[], () => Promise<unknown>]
}

export const TappletsRegistered: React.FC = () => {
  const [registeredTappletsList, fetchTappletsFromRegistry] = useRegisteredTapplets()
  const { showSnackBar } = useSnackBar()

  async function downloadAndExtract(tappletId: number) {
    try {
      await invoke("download_and_extract_tapp", { tappletId: tappletId })
    } catch (error) {
      showSnackBar(error, "error")
    }
  }

  async function validateChecksum(tappletId: number) {
    //TODO use it to display the verification process status
    try {
      const isCheckumValid = await invoke("calculate_and_validate_tapp_checksum", {
        tappletId: tappletId,
      })
      console.log("Checksum validation result: ", isCheckumValid) // unused variable causes build failure
    } catch (error) {
      showSnackBar(error, "error")
    }
  }

  async function installTapplet(tappletId: number) {
    await downloadAndExtract(tappletId)
    await validateChecksum(tappletId)
  }

  const handleInstall = async (tappletId?: number) => {
    if (!tappletId) return
    await installTapplet(tappletId)

    try {
      await invoke("insert_installed_tapp_db", { tappletId: tappletId })
    } catch (error) {
      showSnackBar(error, "error")
    }
  }

  return (
    <div>
      <Typography variant="h4">Registered Tapplets</Typography>
      {registeredTappletsList.length ? (
        registeredTappletsList.map((item) => (
          <List>
            <ListItem key={item.package_name}>
              <ListItemAvatar>
                <Avatar src={tariLogo} />
              </ListItemAvatar>
              <ListItemText primary={item.package_name} />
              <IconButton aria-label="install" onClick={() => handleInstall(item.id)}>
                <InstallDesktop color="primary" />
              </IconButton>
            </ListItem>
          </List>
        ))
      ) : (
        <div>Registered tapplets list is empty</div>
      )}

      <Box>
        <Button variant="contained" sx={{ mr: 1 }} onClick={fetchTappletsFromRegistry}>
          Fetch Tapplet List
        </Button>
        <AddDevTappletDialog />
      </Box>
    </div>
  )
}
