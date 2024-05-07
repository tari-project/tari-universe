import { List } from "@mui/material"
import { TappletInstaller } from "./TappletInstaller"
import { TappletLauncher } from "./TappletLauncher"

export type TappletsListProps = {
  tapplets: TappletListItemProps[]
}

export type TappletListItemProps = {
  name: string
  icon: string
  installed?: boolean
  url?: string
  path?: string
}

export const TappletsList: React.FC<TappletsListProps> = ({ tapplets }) => {
  return (
    <div>
      {tapplets.map((item) => (
        <List>
          {item.installed ? (
            <TappletLauncher tappletId={item.name} />
          ) : (
            <TappletInstaller name={item.name} icon={item.icon} path={item.path} url={item.url} />
          )}
        </List>
      ))}
    </div>
  )
}
