-- Convertir campos numéricos a texto para permitir valores como "Infinito"
ALTER TABLE guns 
ALTER COLUMN magazine_size TYPE text USING magazine_size::text,
ALTER COLUMN max_ammo TYPE text USING max_ammo::text,
ALTER COLUMN reload_time TYPE text USING reload_time::text;
