-- Insert sample data for each category (you can replace this with real data later)

-- Sample Guns
insert into public.guns (name, type, quality, magazine_size, max_ammo, description, notes) values
('Rusty Sidearm', 'Pistol', 'D', 6, 100, 'A trusty starting weapon. Nothing fancy, but it gets the job done.', 'Starting weapon for the Marine.'),
('Mega Douser', 'Water', 'B', 100, 500, 'Sprays a continuous stream of water that can extinguish fuses and stun enemies.', 'Effective against fire-based enemies.');

-- Sample Enemies
insert into public.enemies (name, location, health, behavior, description) values
('Bullet Kin', 'All Chambers', 'Low', 'Walks toward player and shoots single bullets', 'The most common enemy in the Gungeon. Simple but dangerous in groups.'),
('Shotgun Kin', 'All Chambers', 'Medium', 'Walks toward player and shoots spread shots', 'A tougher variant that fires shotgun-style spreads.');

-- Sample Items
insert into public.items (name, type, quality, effect, description) values
('Armor', 'Passive', 'C', 'Grants one hit of protection', 'A piece of armor that absorbs one hit of damage.'),
('Ammo Box', 'Active', 'D', 'Refills ammo for all guns', 'A box full of ammunition for your weapons.');

-- Sample Bosses
insert into public.bosses (name, location, health, phases, description) values
('Gatling Gull', 'Keep of the Lead Lord', 'High', 2, 'A large bird wielding a gatling gun. Becomes more aggressive in second phase.'),
('Bullet King', 'Keep of the Lead Lord', 'High', 1, 'The ruler of the first chamber. Commands Bullet Kin minions.');

-- Sample NPCs
insert into public.npcs (name, location, role, services, description) values
('Bello', 'Shop', 'Shopkeeper', 'Sells guns, items, and ammo', 'The main shopkeeper of the Gungeon. Always has interesting wares.'),
('Cadence', 'Breach', 'Quest Giver', 'Provides quests and rewards', 'A mysterious figure who offers challenges to brave Gungeoneers.');

-- Sample Miscellaneous
insert into public.miscellaneous (name, category, description) values
('Hegemony Credit', 'Currency', 'The primary currency used in the Gungeon. Used to purchase items from shops.'),
('Master Round', 'Collectible', 'Awarded for defeating a boss without taking damage. Permanently increases max health.');
