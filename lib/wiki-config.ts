// Este archivo es el "mapa" de toda la wiki. Define cada categoría.

export type CategoryType = 'entity' | 'page';

export interface CategoryConfig {
  id: string;
  type: CategoryType;
  table: string;
  nameField: string;
}

export const wikiConfig: Record<string, CategoryConfig> = {
  guns: { id: 'guns', type: 'entity', table: 'guns', nameField: 'name' },
  enemies: { id: 'enemies', type: 'entity', table: 'enemies', nameField: 'name' },
  items: { id: 'items', type: 'entity', table: 'items', nameField: 'name' },
  bosses: { id: 'bosses', type: 'entity', table: 'bosses', nameField: 'name' },
  gungeoneers: { id: 'gungeoneers', type: 'entity', table: 'gungeoneers', nameField: 'name' },
  npcs: { id: 'npcs', type: 'entity', table: 'npcs', nameField: 'name' },
  altares: { id: 'altares', type: 'entity', table: 'altares', nameField: 'name' },
  consumibles: { id: 'consumibles', type: 'entity', table: 'consumibles', nameField: 'name' },
  secretos: { id: 'secretos', type: 'entity', table: 'secretos', nameField: 'name' },
  maldicion: { id: 'maldicion', type: 'page', table: 'text_pages', nameField: 'page_name' },
  genialidad: { id: 'genialidad', type: 'page', table: 'text_pages', nameField: 'page_name' },
};
