"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { wikiConfig } from "@/lib/wiki-config";

// --- Definimos y exportamos la estructura de nuestros datos ---
// Así, otros archivos sabrán qué forma tiene un "Gun", un "Boss", etc.
export interface BaseEntity { id: string; name: string | null; [key: string]: any; }
export interface Gun extends BaseEntity {}
export interface Boss extends BaseEntity { common_name?: string | null; is_duo?: boolean | null; }
export interface Item extends BaseEntity {}
export interface Enemy extends BaseEntity {}
export interface Gungeoneer extends BaseEntity {}
export interface Npc extends BaseEntity {}
export interface Altar extends BaseEntity {}
export interface Consumible extends BaseEntity {}
export interface Secreto extends BaseEntity {}
export interface TextPage extends BaseEntity { page_name: string; content: string; }

// --- Definimos qué contendrá nuestra "mochila" ---
interface DataContextType {
  allData: Record<string, BaseEntity[]>; // Un gran "cajón" con todos los datos
  lookupTable: Map<string, { type: string; data: BaseEntity }>; // La tabla de búsqueda para :enlaces:
  
  // Estos los añadiremos en el siguiente paso, pero los dejamos preparados
  openDetailsModal: (item: BaseEntity, type: string) => void;
  closeDetailsModal: () => void;
  modalContent: { type: string; data: BaseEntity } | null;
}

// Creamos la "mochila", inicialmente vacía.
const DataContext = createContext<DataContextType | undefined>(undefined);

// Creamos el componente que llenará y proporcionará la mochila.
export function DataProvider({ children }: { children: ReactNode }) {
  const [allData, setAllData] = useState<Record<string, BaseEntity[]>>({});
  const [lookupTable, setLookupTable] = useState<Map<string, { type: string; data: BaseEntity }>>(new Map());
  const [modalContent, setModalContent] = useState<{ type: string; data: BaseEntity } | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      const supabase = createClient();
      console.log("Índice Maestro: Leyendo el mapa de la wiki...");

      // Leemos nuestro "mapa" para saber qué buscar
      const categories = Object.values(wikiConfig);
      // Creamos una petición a Supabase para cada categoría del mapa
      const promises = categories.map(config => 
        supabase.from(config.table).select('*')
      );

      console.log(`Índice Maestro: Realizando ${promises.length} peticiones a Supabase...`);
      const responses = await Promise.all(promises);

      const newData: Record<string, BaseEntity[]> = {};
      const newLookupTable = new Map<string, { type: string; data: BaseEntity }>();

      // Procesamos la respuesta de cada petición
      responses.forEach((response, index) => {
        const config = categories[index];
        const data = response.data || [];
        
        newData[config.id] = data; // Guardamos la lista de datos

        // Añadimos cada item a nuestra tabla de búsqueda para los :enlaces:
        data.forEach((item: BaseEntity) => {
          const name = item[config.nameField];
          if (name) {
            newLookupTable.set(name.toLowerCase(), { type: config.id, data: item });
          }
          // Caso especial para los jefes dúo
          if (config.id === 'bosses' && item.is_duo && item.common_name) {
            newLookupTable.set(item.common_name.toLowerCase(), { type: config.id, data: item });
          }
        });
      });
      
      setAllData(newData);
      setLookupTable(newLookupTable);
      console.log("Índice Maestro: ¡Datos cargados! El índice tiene", newLookupTable.size, "entradas.");
    };

    fetchAllData();
  }, []); // El [] vacío asegura que esto solo se ejecuta una vez al cargar la app.

  // Funciones para el pop-up que usaremos en el siguiente paso
  const openDetailsModal = (item: BaseEntity, type: string) => { setModalContent({ type, data: item }); };
  const closeDetailsModal = () => { setModalContent(null); };

  const value = { allData, lookupTable, modalContent, openDetailsModal, closeDetailsModal };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Un "atajo" para que otros componentes usen la mochila
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData debe ser usado dentro de un DataProvider");
  }
  return context;
}
