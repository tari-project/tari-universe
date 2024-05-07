import { invoke } from "@tauri-apps/api/core"
import { useState } from "react"
import { TappletProps } from "./Tapplet"
import { Avatar, IconButton, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { NavLink } from "react-router-dom"
import { InstallDesktop, Launch } from "@mui/icons-material"
import { TappletListItemProps } from "./TappletsList"
import tariLogo from "../assets/tari.svg"
import { TabKey } from "../views/Tabs"

export function TappletInstaller({ tappletId }: TappletProps) {
  //TODO use Tauri BaseDir
  const basePath = "/home/oski/Projects/tari/tari-universe/tapplets_installed"

  //TODO get tapplet data from registry with tappletId
  const [name, setName] = useState("tapplet-name")
  const [url, setUrl] = useState("https://registry.npmjs.org/aa-schnorr-multisig/-/aa-schnorr-multisig-1.0.6.tgz")
  const [checksumCorrectness, setChecksumCorrectness] = useState(false)
  const [path, setPath] = useState(basePath)

  async function calculateShasum() {
    const calculatedChecksum: string = await invoke("calculate_tapp_checksum", {
      tappletPath: path,
    })

    /**
      TODO uncomment if extracted tapplet folder contains tapplet.manifest.json file
      with "integrity" field
      
      const areEq: boolean = await invoke("validate_tapp_checksum", {
        checksum: calculatedChecksum,
        tappletPath: path,
      });
    */
    const isCheckumCorrect = true
    setChecksumCorrectness(isCheckumCorrect)
  }

  async function downloadAndExtract() {
    await invoke("download_tapp", { url, tappletPath: path })
    await invoke("extract_tapp_tarball", { tappletPath: path })
    await invoke("check_tapp_files", { tappletPath: path })
    await calculateShasum()
  }

  //TODO
  const handleInstall = () => {
    downloadAndExtract()
  }

  const item: TappletListItemProps = {
    name: "tst",
    icon: tariLogo,
    installed: false,
  }

  return (
    <ListItem
      key={tappletId}
      secondaryAction={
        // TODO this is just mvp- component refactor needed
        <IconButton aria-label="install" edge="start">
          <InstallDesktop onClick={handleInstall} color="primary" />
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Avatar src={item.icon} />
      </ListItemAvatar>
      <ListItemText primary={tappletId} />
    </ListItem>
  )
}
