import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material"
import { InstallDesktop } from "@mui/icons-material"

export type TappletRegistryProps = {
  tapplets: RegisteredTapplet[]
}

export type RegisteredTapplet = {
  name: string
  icon: string
}

export const TappletRegistry: React.FC<TappletRegistryProps> = ({ tapplets }) => {
  //TODO
  const handleInstall = () => {
    console.log("install tapplet")
  }

  return (
    <div>
      {tapplets.map((item, i) => (
        <List>
          <ListItem
            key={i}
            secondaryAction={
              <IconButton aria-label="install" edge="start">
                <InstallDesktop onClick={handleInstall} />
              </IconButton>
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
