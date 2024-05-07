import { invoke } from "@tauri-apps/api/core"
import { useState } from "react"
import { TappletProps } from "./Tapplet"
import { Avatar, IconButton, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { NavLink } from "react-router-dom"
import { InstallDesktop, Launch } from "@mui/icons-material"
import { TappletListItemProps } from "./TappletsList"
import tariLogo from "../assets/tari.svg"
import { TabKey } from "../views/Tabs"

export function TappletLauncher({ tappletId }: TappletProps) {
  //TODO use Tauri BaseDir
  const basePath = "/home/oski/Projects/tari/tari-universe/tapplets_installed"

  const handleLaunch = () => {
    console.log("launch tapplet")
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
          <NavLink to={TabKey.ACTIVE_TAPPLET}>
            <Launch onClick={handleLaunch} color="primary" />
          </NavLink>
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
