export interface WikiLinkToken {
  type: 'text' | 'link';
  content: string;
}

export function parseWikiLinks(text: string): WikiLinkToken[] {
  if (!text) {
    return [];
  }

  const regex = /:([a-zA-Z0-9\s\-.']+):/g;
  const tokens: WikiLinkToken[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }
    tokens.push({
      type: 'link',
      content: match[1].trim(),
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  // --- MICRÓFONO ---
  console.log(`[Wiki-Parser] Texto: "${text.substring(0, 50)}...". Trozos encontrados:`, tokens);
  // ------------------

  return tokens;
}
