import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { InstallDesktop, Launch } from "@mui/icons-material"
import { TabKey } from "../views/Tabs"
import { NavLink } from "react-router-dom"

export type TappletsListProps = {
  tapplets: TappletListItemProps[]
}

export type TappletListItemProps = {
  name: string
  icon: string
  installed?: boolean
}

export const TappletsList: React.FC<TappletsListProps> = ({ tapplets }) => {
  //TODO
  const handleInstall = () => {
    console.log("install tapplet")
  }

  const handleLaunch = () => {
    console.log("launch tapplet")
  }

  return (
    <div>
      {tapplets.map((item, i) => (
        <List>
          <ListItem
            key={i}
            secondaryAction={
              // TODO this is just mvp- component refactor needed
              item.installed ? (
                <IconButton aria-label="install" edge="start">
                  <NavLink to={TabKey.ACTIVE_TAPPLET}>
                    <Launch onClick={handleLaunch} color="primary" />
                  </NavLink>
                </IconButton>
              ) : (
                <IconButton aria-label="install" edge="start">
                  <InstallDesktop onClick={handleInstall} color="primary" />
                </IconButton>
              )
            }
          >
            <ListItemAvatar>
              <Avatar src={item.icon} />
            </ListItemAvatar>
            <ListItemText primary={item.name} />
          </ListItem>
        </List>
      ))}
    </div>
  )
}
