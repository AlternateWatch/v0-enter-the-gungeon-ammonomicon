"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { wikiConfig } from "@/lib/wiki-config";

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

interface DataContextType {
  isLoading: boolean;
  allData: Record<string, BaseEntity[]>;
  lookupTable: Map<string, { type: string; data: BaseEntity }>;
  openDetailsModal: (item: BaseEntity, type: string) => void;
  closeDetailsModal: () => void;
  modalContent: { type: string; data: BaseEntity } | null;
  forceRefetch: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [allData, setAllData] = useState<Record<string, BaseEntity[]>>({});
  const [lookupTable, setLookupTable] = useState<Map<string, { type: string; data: BaseEntity }>>(new Map());
  const [modalContent, setModalContent] = useState<{ type: string; data: BaseEntity } | null>(null);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const categories = Object.values(wikiConfig);
    const promises = categories.map(config => supabase.from(config.table).select('*'));
    const responses = await Promise.all(promises);
    const newData: Record<string, BaseEntity[]> = {};
    const newLookupTable = new Map<string, { type: string; data: BaseEntity }>();
    responses.forEach((response, index) => {
      const config = categories[index];
      const data = response.data || [];
      newData[config.id] = data;
      data.forEach((item: BaseEntity) => {
        const name = item[config.nameField];
        if (name) { newLookupTable.set(name.toLowerCase(), { type: config.id, data: item }); }
        if (config.id === 'bosses' && item.is_duo && item.common_name) { newLookupTable.set(item.common_name.toLowerCase(), { type: config.id, data: item }); }
      });
    });
    setAllData(newData);
    setLookupTable(newLookupTable);
    setIsLoading(false);

    // --- MICRÓFONO ---
    console.log(`[DataContext] Índice Maestro construido. Total: ${newLookupTable.size} entradas.`);
    const keys = Array.from(newLookupTable.keys());
    console.log("Ejemplos de claves en el índice:", keys.slice(0, 10)); // Mostramos 10 para más info
    // ------------------
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const openDetailsModal = (item: BaseEntity, type: string) => { setModalContent({ type, data: item }); };
  const closeDetailsModal = () => { setModalContent(null); };

  const value = { isLoading, allData, lookupTable, modalContent, openDetailsModal, closeDetailsModal, forceRefetch: fetchAllData };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData debe ser usado dentro de un DataProvider");
  }
  return context;
}
