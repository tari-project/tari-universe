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
}

export const TappletsList: React.FC<TappletsListProps> = ({ tapplets }) => {
  return (
    <div>
      {tapplets.map((item) => (
        <List>
          {item.installed ? <TappletLauncher tappletId={item.name} /> : <TappletInstaller tappletId={item.name} />}
        </List>
      ))}
    </div>
  )
}
