INSERT INTO business (name) VALUES
  ('PM Fresh'),
  ('Nuzest');

INSERT INTO country (name) VALUES 
  ('New Zealand'),
  ('Australia'),
  ('United States'),
  ('United Kingdom'),
  ('Canada'),
  ('China'),
  ('Japan');


INSERT INTO market_group (name, business_id) VALUES
  ('Aus/NZ PM Fresh', 1),
  ('USA/CAN PM Fresh', 1),
  ('Aus/NZ Nuzest', 2),
  ('USA/CAN Nuzest', 2);

INSERT INTO country_on_market_group (market_group_id, country_id) VALUES
  (1, 1),
  (1, 2),
  (2, 3),
  (2, 5),
  (3, 1),
  (3, 2),
  (4, 3),
  (4, 5);

INSERT INTO product (title, business_id) VALUES
  ('A delicious salad', 1),
  ('Coleslaw', 1),
  ('Tofu salad', 1),
  ('Vegemite', 2),
  ('Milo', 2),
  ('Tim Tams', 2);

INSERT INTO market_article (product_id, market_group_id) VALUES
  (1, 1),
  (1, 2),
  (2, 1),
  (2, 2),
  (3, 1),
  (3, 2),
  (4, 3),
  (4, 4),
  (5, 3),
  (5, 4),
  (6, 3),
  (6, 4);

INSERT INTO artwork_item (market_article_id, layer) VALUES
  (1, 'Inner'),
  (1, 'MPO'),
  (2, 'Inner'),
  (2, 'MPO'),
  (3, 'Inner'),
  (3, 'MPO'),
  (4, 'Inner'),
  (4, 'MPO'),
  (5, 'Inner'),
  (5, 'MPO'),
  (6, 'Inner'),
  (6, 'MPO');

