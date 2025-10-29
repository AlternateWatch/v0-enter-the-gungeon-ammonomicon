"use client"
import { useState, useEffect } from "react";
import { useData, Enemy } from "@/context/DataContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface EnemiesPageProps { searchQuery: string; }

export function EnemiesPage({ searchQuery }: EnemiesPageProps) {
  const { allData, openDetailsModal } = useData();
  const [localEnemies, setLocalEnemies] = useState<Enemy[]>([]);

  useEffect(() => { setLocalEnemies(allData.enemies || []); }, [allData.enemies]);

  const handleCardClick = (enemy: Enemy) => { openDetailsModal(enemy, 'enemies'); }

  const filteredEnemies = localEnemies.filter((enemy) => enemy.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Enemigos</h2>
        <p className="text-muted-foreground">Listado de todos los enemigos de la Armazmorra.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredEnemies.map((enemy) => (
          <Card key={enemy.id} onClick={() => handleCardClick(enemy)} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              {enemy.image_url && <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4"><img src={enemy.image_url} alt={enemy.name || ""} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }} /></div>}
              <CardTitle>{enemy.name}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground line-clamp-3">{enemy.description || ""}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
