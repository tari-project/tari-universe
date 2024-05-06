import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { InstallDesktop, Launch } from "@mui/icons-material"

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
              item.installed ? (
                <IconButton aria-label="install" edge="start">
                  <Launch onClick={handleLaunch} color="primary" />
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
