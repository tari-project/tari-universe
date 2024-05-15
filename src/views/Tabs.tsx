import React, { useState } from "react"

export enum TabKey {
  TAPPLET_REGISTRY = "tapplet-registry",
  INSTALLED_TAPPLETS = "installed-tapplets",
  DEV_TAPPLETS = "dev-tapplets",
  ACTIVE_TAPPLET = "active-tapplet",
  WALLET = "wallet",
}

export const Tabs: React.FC<{ tabs: { id: string; name: string; component: React.ReactElement }[] }> = ({ tabs }) => {
  const [activeTabId, setActiveTabId] = useState(tabs[0].id)

  const activeTab = React.useMemo(() => tabs.find((tab) => tab.id === activeTabId), [tabs, activeTabId])

  return (
    <div>
      {tabs.map((tab) => (
        <button disabled={tab.id === activeTabId} onClick={() => setActiveTabId(tab.id)}>
          {tab.name}
        </button>
      ))}
      {activeTab?.component}
    </div>
  )
}
