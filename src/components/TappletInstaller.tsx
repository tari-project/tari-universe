import { invoke } from "@tauri-apps/api/core"
import { useState } from "react"
import { TappletProps } from "./Tapplet"
import { Avatar, IconButton, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { NavLink } from "react-router-dom"
import { InstallDesktop, Launch } from "@mui/icons-material"
import { TappletListItemProps } from "./TappletsList"
import tariLogo from "../assets/tari.svg"
import { TabKey } from "../views/Tabs"
import { RegisteredTapplet } from "../types/tapplet/Tapplet"

export function TappletInstaller(tapplet: TappletListItemProps) {
  //TODO use Tauri BaseDir
  const basePath = "/home/oski/Projects/tari/tari-universe/tapplets_installed"
  const baseUrl = "https://registry.npmjs.org/tapp-example/-/tapp-example-1.0.0.tgz"

  const [checksumCorrectness, setChecksumCorrectness] = useState(false)
  //TODO get tapplet data from registry with tappletId
  // const [name, setName] = useState("tapplet-name")
  // const [url, setUrl] = useState(baseUrl)
  // const [path, setPath] = useState(basePath)

  async function calculateShasum(path: string) {
    const calculatedChecksum: string = await invoke("calculate_tapp_checksum", {
      tappletPath: path,
    })

    /**
      TODO uncomment if extracted tapplet folder contains tapplet.manifest.json file
      with "integrity" field
      const isCheckumCorrect = true
      */

    const isCheckumValid: boolean = await invoke("validate_tapp_checksum", {
      checksum: calculatedChecksum,
      tappletPath: path,
    })
    setChecksumCorrectness(isCheckumValid)
  }

  async function downloadAndExtract(url: string, path: string) {
    await invoke("download_tapp", { url, tappletPath: path })
    await invoke("extract_tapp_tarball", { tappletPath: path })
    await invoke("check_tapp_files", { tappletPath: path })
    await calculateShasum(path)
    // TODO insert tapp to installed_tapplet db

    const tapp: RegisteredTapplet = {
      package_name: tapplet.name,
      version: "1.1.9",
      description: "demo tapp",
      display_name: "Example tapp",
      image_id: 0,
    }
    invoke("insert_tapp_registry_db", { tapplet: tapp })
    invoke("read_tapp_registry_db", {})
  }

  //TODO
  const handleInstall = () => {
    const _url = tapplet.url ?? baseUrl
    const _path = tapplet.path ?? basePath
    downloadAndExtract(_url, _path)
  }

  // const item: TappletListItemProps = {
  //   name: "tst",
  //   icon: tariLogo,
  //   installed: false,
  //   path: basePath,
  //   url: "https://registry.npmjs.org/tapp-example/-/tapp-example-1.0.0.tgz",
  // }

  return (
    <ListItem
      key={tapplet.name}
      secondaryAction={
        // TODO this is just mvp- component refactor needed
        <IconButton aria-label="install" edge="start">
          <InstallDesktop onClick={handleInstall} color="primary" />
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Avatar src={tapplet.icon} />
      </ListItemAvatar>
      <ListItemText primary={tapplet.name} />
    </ListItem>
  )
}
