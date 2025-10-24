"use client"

import { useState } from "react"
import { Book, Crosshair, Skull, Package, Users, Church, Apple, Key, Flame, Sparkles, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { GunsPage } from "@/components/pages/guns-page"
import { EnemiesPage } from "@/components/pages/enemies-page"
import { ItemsPage } from "@/components/pages/items-page"
import { BossesPage } from "@/components/pages/bosses-page"
import { NpcsPage } from "@/components/pages/npcs-page"
import { AltaresPage } from "@/components/pages/altares-page"
import { ConsumiblesPage } from "@/components/pages/consumibles-page"
import { SecretosPage } from "@/components/pages/secretos-page"
import { MaldicionPage } from "@/components/pages/maldicion-page"
import { GenialidadPage } from "@/components/pages/genialidad-page"

type PageType =
  | "guns"
  | "enemies"
  | "items"
  | "bosses"
  | "npcs"
  | "altares"
  | "consumibles"
  | "secretos"
  | "maldicion"
  | "genialidad"

const navigation = [
  { id: "guns" as PageType, name: "Armas", icon: Crosshair },
  { id: "enemies" as PageType, name: "Enemigos", icon: Skull },
  { id: "items" as PageType, name: "Items", icon: Package },
  { id: "bosses" as PageType, name: "Bosses", icon: Skull },
  { id: "npcs" as PageType, name: "NPCs", icon: Users },
  { id: "altares" as PageType, name: "Altares", icon: Church },
  { id: "consumibles" as PageType, name: "Consumibles", icon: Apple },
  { id: "secretos" as PageType, name: "Secretos", icon: Key },
  { id: "maldicion" as PageType, name: "Maldición", icon: Flame },
  { id: "genialidad" as PageType, name: "Genialidad", icon: Sparkles },
]

export function AmmonomiconShell() {
  const [currentPage, setCurrentPage] = useState<PageType>("guns")
  const [searchQuery, setSearchQuery] = useState("")

  const renderPage = () => {
    const props = { searchQuery }
    switch (currentPage) {
      case "guns":
        return <GunsPage {...props} />
      case "enemies":
        return <EnemiesPage {...props} />
      case "items":
        return <ItemsPage {...props} />
      case "bosses":
        return <BossesPage {...props} />
      case "npcs":
        return <NpcsPage {...props} />
      case "altares":
        return <AltaresPage />
      case "consumibles":
        return <ConsumiblesPage />
      case "secretos":
        return <SecretosPage />
      case "maldicion":
        return <MaldicionPage />
      case "genialidad":
        return <GenialidadPage />
      default:
        return <GunsPage {...props} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Book className="w-8 h-8 text-sidebar-primary" />
            <h1 className="text-2xl font-bold text-sidebar-foreground">Balanomicón</h1>
          </div>
          <p className="text-sm text-sidebar-foreground/60 mt-2">Enciclopedia de Enter The Gungeon</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentPage === item.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50 text-center">
            Datos sacados del juego y la wiki en inglés de Enter The Gungeon
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="p-6">
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar en el Balanomicón..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">{renderPage()}</div>
      </main>
    </div>
  )
}
