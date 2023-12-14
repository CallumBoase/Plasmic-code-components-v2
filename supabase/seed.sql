--create users
-- select public.create_user('test@example.com', 'password');
-- select public.create_user('tes2t@example.com', 'password');
-- select public.create_user('test3@example.com', 'password');

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
  ('Fruit Salad Watermelon Fingers', 1);

INSERT INTO market_article (product_id, market_group_id) VALUES
  (1, 1);

INSERT INTO artwork_item (market_article_id, layer) VALUES
  (1, 'Single'); 