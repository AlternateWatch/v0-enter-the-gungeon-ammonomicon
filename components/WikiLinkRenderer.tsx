"use client"

import { parseWikiLinks, WikiLinkToken } from "@/lib/wiki-parser"; // <-- CORRECCIÓN: Usa 'parseWikiLinks'
import { useData } from "@/context/DataContext";

interface WikiLinkRendererProps {
  text: string | null | undefined;
}

export function WikiLinkRenderer({ text }: WikiLinkRendererProps) {
  const { isLoading, lookupTable, openDetailsModal } = useData();

  if (!text) return null;
  if (isLoading) return <>{text}</>;

  // --- CORRECCIÓN: Usa 'parseWikiLinks' ---
  const tokens = parseWikiLinks(text);

  const handleLinkClick = (itemName: string) => {
    const lowerCaseItemName = itemName.toLowerCase();
    const linkData = lookupTable.get(lowerCaseItemName);
    if (linkData) {
      openDetailsModal(linkData.data, linkData.type);
    }
  };

  return (
    <>
      {tokens.map((token, index) => {
        if (token.type === 'link') {
          const lowerCaseContent = token.content.toLowerCase();
          const linkData = lookupTable.get(lowerCaseContent);

          if (linkData) {
            return (
              <button key={index} onClick={() => handleLinkClick(token.content)}
                className="text-blue-500 hover:underline inline p-0 m-0 bg-transparent border-none cursor-pointer font-medium">
                {token.content}
              </button>
            );
          }
        }
        return <span key={index}>{token.type === 'link' ? `:${token.content}:` : token.content}</span>;
      })}
    </>
  );
}
