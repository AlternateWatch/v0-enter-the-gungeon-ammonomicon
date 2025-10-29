// Este archivo es el "Índice de Archivadores".
// Asocia el ID de una categoría de nuestra wiki con su componente de plantilla de detalles.

import { BossDetails } from "@/components/details/BossDetails";
import { GunDetails } from "@/components/details/GunDetails";
import { EnemyDetails } from "@/components/details/EnemyDetails";
import { ItemDetails } from "@/components/details/ItemDetails";
import { GungeoneerDetails } from "@/components/details/GungeoneerDetails";
import { NpcDetails } from "@/components/details/NpcDetails";
import { AltarDetails } from "@/components/details/AltarDetails";
import { ConsumibleDetails } from "@/components/details/ConsumibleDetails";
import { SecretoDetails } from "@/components/details/SecretoDetails";
import { MaldicionDetails } from "@/components/details/MaldicionDetails";
import { GenialidadDetails } from "@/components/details/GenialidadDetails";
import type { BaseEntity } from "@/context/DataContext";

// Definimos el tipo para que TypeScript entienda que cada plantilla es un componente de React
type DetailComponent = React.ComponentType<{ item: BaseEntity }>;

export const detailsRegistry: Record<string, DetailComponent> = {
  guns: GunDetails,
  enemies: EnemyDetails,
  items: ItemDetails,
  bosses: BossDetails,
  gungeoneers: GungeoneerDetails,
  npcs: NpcDetails,
  altares: AltarDetails,
  consumibles: ConsumibleDetails,
  secretos: SecretoDetails,
  maldicion: MaldicionDetails,
  genialidad: GenialidadDetails,
};
