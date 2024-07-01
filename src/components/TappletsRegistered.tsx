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
        await invoke("fetch_tapplets")
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
    <Box marginX="auto" mt={4}>
      <Typography variant="h4" textAlign="center" pt={6}>
        Registered Tapplets
      </Typography>
      {registeredTappletsList?.length ?? 0 > 0 ? (
        <List sx={{ width: "100%", minWidth: 500 }}>
          {registeredTappletsList?.map((item) => (
            <ListItem key={item.package_name} sx={{ paddingTop: 2 }}>
              <ListItemAvatar>
                <Avatar src={tariLogo} />
              </ListItemAvatar>
              <ListItemText primary={item.package_name} />
              <IconButton aria-label="install" onClick={() => handleInstall(item.id)} sx={{ marginLeft: 8 }}>
                <InstallDesktop color="primary" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography textAlign="center">Registered tapplets list is empty</Typography>
      )}
      <Box pt={4} display="flex" justifyContent="center" gap={1}>
        <Button variant="contained" onClick={fetchTappletsFromRegistry}>
          Fetch Tapplet List
        </Button>
        <AddDevTappletDialog />
      </Box>
    </Box>
  )
}
