"use client"
import { useState, useEffect } from "react";
import { useData, Npc } from "@/context/DataContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface NpcsPageProps { searchQuery: string; }

export function NpcsPage({ searchQuery }: NpcsPageProps) {
  const { allData, openDetailsModal } = useData();
  const [localNpcs, setLocalNpcs] = useState<Npc[]>([]);

  useEffect(() => { setLocalNpcs(allData.npcs || []); }, [allData.npcs]);

  const handleCardClick = (npc: Npc) => { openDetailsModal(npc, 'npcs'); }

  const filteredNpcs = localNpcs.filter((npc) => npc.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">NPCs</h2>
        <p className="text-muted-foreground">Personajes no jugables que habitan la Armazmorra.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredNpcs.map((npc) => (
          <Card key={npc.id} onClick={() => handleCardClick(npc)} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              {npc.image_url && <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4"><img src={npc.image_url} alt={npc.name || ""} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }} /></div>}
              <CardTitle>{npc.name}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground line-clamp-3">{npc.description || ""}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
