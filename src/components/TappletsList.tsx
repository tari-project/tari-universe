import { List } from "@mui/material"
import { TappletInstaller } from "./TappletInstaller"
import { TappletLauncher } from "./TappletLauncher"
import tariLogo from "../assets/tari.svg"

export type TappletsListProps = {
  installed: boolean
}

export type TappletListItemProps = {
  name: string
  icon: string
  installed?: boolean
  url?: string
  path?: string
}

export const TappletsList: React.FC<TappletsListProps> = ({ installed }) => {
  const TAPPLET_ID = "tapplet_id"
  //TODO parse json to registry struct
  const tappletRegistry: TappletListItemProps[] = [
    {
      name: "OK Tapp Example",
      icon: tariLogo,
      installed: false,
      url: "https://registry.npmjs.org/tapp-example/-/tapp-example-1.0.0.tgz",
      path: "/home/oski/Projects/tari/tari-universe/tapplets_installed/tapp-example",
    },
    {
      name: "MC Tapplet example",
      icon: tariLogo,
      installed: false,
      url: "https://registry.npmjs.org/tapplet-example/-/tapplet-example-0.0.2.tgz",
      path: "/home/oski/Projects/tari/tari-universe/tapplets_installed/tapplet-example",
    },
    {
      name: "OK Tapp Example Second",
      icon: tariLogo,
      installed: false,
      url: "https://registry.npmjs.org/tapp-example/-/tapp-example-1.0.0.tgz",
      path: "/home/oski/Projects/tari/tari-universe/tapplets_installed/tapp-example_two",
    },
    {
      name: "OK Tapp Example Third",
      icon: tariLogo,
      installed: false,
      url: "https://registry.npmjs.org/tapp-example/-/tapp-example-1.0.0.tgz",
      path: "/home/oski/Projects/tari/tari-universe/tapplets_installed/tapp-example_three",
    },
  ]

  //TODO parse json to registry struct
  const installedTappletList: TappletListItemProps[] = [
    {
      name: "Installed tapplet example",
      icon: tariLogo,
      installed: true,
    },
  ]
  // lista zarejestrowanych item.installed?

  const tapplets = installed ? installedTappletList : tappletRegistry

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
