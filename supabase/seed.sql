--create users
--To get this code, create users in dashboard
-- then run in terminal: pg_dump --data-only --inserts --column-inserts -n public -n auth postgresql://postgres:postgres@localhost:54322/postgres > backup.sql
-- Copy paste auth.user and auth.identities
-- Reset DB and then it should seed as expected
--https://github.com/orgs/supabase/discussions/9251
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at) VALUES ('00000000-0000-0000-0000-000000000000', '8a99fdfc-b87f-43ac-9e1c-f45a2b50f1e5', 'authenticated', 'authenticated', 'john@example.com', '$2a$10$IFgLw6Ot7tBqeecIM0adgOOMKFdYi1rTzNIFqDZTg/RTCtlqmlv/e', '2023-12-14 18:44:36.607701+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-12-14 18:44:36.593099+00', '2023-12-14 18:44:36.60781+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at) VALUES ('00000000-0000-0000-0000-000000000000', 'e7907d1f-9c08-4b53-b20f-c9d9bc976975', 'authenticated', 'authenticated', 'jane@example.com', '$2a$10$tISLykNku1gfbknvW8mUQuCy04RJzz9dS31U0VCql5I/ARLRnwbCu', '2023-12-14 18:44:46.55467+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-12-14 18:44:46.549776+00', '2023-12-14 18:44:46.554918+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at) VALUES ('00000000-0000-0000-0000-000000000000', '534e356e-e5d4-4f3c-a13a-f8373686a6c1', 'authenticated', 'authenticated', 'cathy@example.com', '$2a$10$ZFTJbNJP2SzDClZ6a3eAuOPejGWqJHqiXi0IIJ8OBkh1x.qMGIxJ.', '2023-12-14 18:44:58.638781+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-12-14 18:44:58.633545+00', '2023-12-14 18:44:58.638947+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at) VALUES ('00000000-0000-0000-0000-000000000000', '3efa0125-933f-46c1-8cef-2aa7f469dea3', 'authenticated', 'authenticated', 'callum@example.com', '$2a$10$tN9YSpmaP/p0R81Qunk38.OmtlJMlXh9bQScsKYJWUuLXVVIVcg7W', '2023-12-14 18:45:06.713067+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-12-14 18:45:06.707029+00', '2023-12-14 18:45:06.713174+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) VALUES ('8a99fdfc-b87f-43ac-9e1c-f45a2b50f1e5', '8a99fdfc-b87f-43ac-9e1c-f45a2b50f1e5', '{"sub": "8a99fdfc-b87f-43ac-9e1c-f45a2b50f1e5", "email": "john@example.com", "email_verified": false, "phone_verified": false}', 'email', '2023-12-14 18:44:36.603392+00', '2023-12-14 18:44:36.603448+00', '2023-12-14 18:44:36.603448+00', 'b7d02b37-d487-43ae-badf-d5a849b03540');
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) VALUES ('e7907d1f-9c08-4b53-b20f-c9d9bc976975', 'e7907d1f-9c08-4b53-b20f-c9d9bc976975', '{"sub": "e7907d1f-9c08-4b53-b20f-c9d9bc976975", "email": "jane@example.com", "email_verified": false, "phone_verified": false}', 'email', '2023-12-14 18:44:46.55084+00', '2023-12-14 18:44:46.550865+00', '2023-12-14 18:44:46.550865+00', '107d73fa-571a-4822-a5c5-e713c35c40cc');
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) VALUES ('534e356e-e5d4-4f3c-a13a-f8373686a6c1', '534e356e-e5d4-4f3c-a13a-f8373686a6c1', '{"sub": "534e356e-e5d4-4f3c-a13a-f8373686a6c1", "email": "cathy@example.com", "email_verified": false, "phone_verified": false}', 'email', '2023-12-14 18:44:58.634745+00', '2023-12-14 18:44:58.634797+00', '2023-12-14 18:44:58.634797+00', '3fb57105-7324-4dc9-921e-0aec4e2017fc');
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) VALUES ('3efa0125-933f-46c1-8cef-2aa7f469dea3', '3efa0125-933f-46c1-8cef-2aa7f469dea3', '{"sub": "3efa0125-933f-46c1-8cef-2aa7f469dea3", "email": "callum@example.com", "email_verified": false, "phone_verified": false}', 'email', '2023-12-14 18:45:06.709351+00', '2023-12-14 18:45:06.709518+00', '2023-12-14 18:45:06.709518+00', 'b410ec65-0bda-4a07-b0b4-af6aae892bcf');


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

INSERT INTO copy_element (name) VALUES
  ('Brand and Logo'),
  ('Product name and description'),
  ('Flavour/variant'),
  ('Tagline/flag'),
  ('FoP tick points or call outs'),
  ('FoP claims'),
  ('FoP marketing icons'),
  ('FoP marketing images'),
  ('FoP compliance'),
  ('Net quantity statement'),
  ('BoP tick points or call outs'),
  ('BoP claims'),
  ('BoP marketing icons'),
  ('BoP marketing images'),
  ('Product romance copy'),
  ('Brand blurb'),
  ('Consumer recipe or preparation suggestions'),
  ('Recycling'),
  ('Barcode & Pkg code ID'),
  ('Social media + website'),
  ('Ingredient listing + %'),
  ('Allergen declarations'),
  ('Warnings and advisory statements and icons'),
  ('Nutrition information'),
  ('Directions for use or cooking instructions'),
  ('Storage instructions'),
  ('Date marking and lot ID'),
  ('Country of origin statements and icons'),
  ('Business name and address'),
  ('BoP compliance');

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

INSERT INTO artwork_item (market_article_id, layer, dieline_file_bucketname, dieline_file_filepath) VALUES
  (1, 'Single', 'artwork-checking-mock-pdf', 'lm12548.pdf'); 

INSERT INTO artwork_version (type, artwork_item_id, title, digital_check, physical_check, barcode_check, artwork_file_bucketname, artwork_file_filepath) VALUES
  ('Artwork creation', 1, 'v1', 'Pending', 'N/A', 'N/A', 'artwork-checking-mock-pdf', 'aim_localkitchen_watermelonfingers_2023_v1a.pdf');

INSERT INTO project_role (role, user_id, artwork_item_id, business_responsible_id) VALUES
  ('Project manager', '8a99fdfc-b87f-43ac-9e1c-f45a2b50f1e5', 1, 1),
  ('Artwork creation manager', 'e7907d1f-9c08-4b53-b20f-c9d9bc976975', 1, 1),
  ('Chief artwork checker', '534e356e-e5d4-4f3c-a13a-f8373686a6c1', 1, 1),
  ('Artwork checker', '3efa0125-933f-46c1-8cef-2aa7f469dea3', 1, 1);

INSERT INTO copy_requirement(artwork_item_id, copy_element_id, copy_item_id, artwork_check_status, designer_notes_artwork_specific) VALUES
  (1, 1, NULL, 'Accepted', 'Some artwork-specific designer notes'),
  (1, 2, NULL, 'Pending', NULL),
  (1, 3, NULL, 'Pending', NULL),
  (1, 4, NULL, 'Pending', NULL),
  (1, 5, NULL, 'Pending', NULL),
  (1, 6, NULL, 'Pending', NULL),
  (1, 7, NULL, 'Pending', NULL),
  (1, 8, NULL, 'Pending', NULL),
  (1, 9, NULL, 'Pending', NULL),
  (1, 10, NULL, 'Pending', NULL),
  (1, 11, NULL, 'Pending', NULL),
  (1, 12, NULL, 'Pending', NULL),
  (1, 13, NULL, 'Pending', NULL),
  (1, 14, NULL, 'Pending', NULL),
  (1, 15, NULL, 'Pending', NULL),
  (1, 16, NULL, 'Pending', NULL),
  (1, 17, NULL, 'Pending', NULL),
  (1, 18, NULL, 'Pending', NULL),
  (1, 19, NULL, 'Pending', NULL),
  (1, 20, NULL, 'Pending', NULL),
  (1, 21, NULL, 'Pending', NULL),
  (1, 22, NULL, 'Pending', NULL),
  (1, 23, NULL, 'Pending', NULL),
  (1, 24, NULL, 'Pending', NULL),
  (1, 25, NULL, 'Pending', NULL),
  (1, 26, NULL, 'Pending', NULL),
  (1, 27, NULL, 'Pending', NULL),
  (1, 28, NULL, 'Pending', NULL),
  (1, 29, NULL, 'Pending', NULL),
  (1, 30, NULL, 'Pending', NULL);

INSERT INTO
  artwork_check_history (
    copy_requirement_id,
    artwork_version_id,
    action_done,
    ac_comment,
    designer_instruction,
    screenshot_bucketname,
    screenshot_filepath,
    fixed,
    user_id
  )
VALUES
  (2, 1, 'Feedback added', NULL, 'Change fingers to capital F.', 'artwork-checking-mock-img', 'artwork_check_history/fingers-to-f.png', FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (2, 1, 'Rejected', NULL, NULL, NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (2, 1, 'Feedback added', 'Not fixed. Sarah to approve if OK with small f.', 'Change fingers to capital F (as per earlier feedback)', NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (5, 1, 'Feedback added', 'Cathy: now done. Sarah tick off when reviewed.', 'Update "Washed & ready to eat!" to "ready to eat!"', NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (5, 1, 'Rejected', NULL, NULL, NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (5, 1, 'N/A', NULL, NULL, NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (5, 1, 'Accepted', NULL, NULL, NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (4, 1, 'Rejected', NULL, NULL, NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (4, 1, 'Feedback added', NULL, 'Update spelling of "savor" to "savour"', NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (19, 1, 'Rejected', NULL, NULL, NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (19, 1, 'Feedback added', NULL, 'Insert barcode', 'artwork-checking-mock-img', 'artwork_check_history/barcode.png', FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (19, 1, 'Feedback added', NULL, 'Increase barcode white/quiet space on left by 1mm', NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (9, 1, 'Feedback added', NULL, 'PACKAGING CODES. TOP LABEL: change Xs to 890622/Z37813. BOTTOM LABEL: change Xs to 890623/Z37814', 'artwork-checking-mock-img', 'artwork_check_history/barcode.png', FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (9, 1, 'Feedback added', NULL, 'Watermark: S1J (bottom label: add onto barcode) and (top label: add above packaging code)', NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (9, 1, 'Rejected', NULL, NULL, NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (12, 1, 'Feedback added', 'Sarah to remove suitable for vegetarians from artwork brief.', 'Remove NHMRC text - not making claim on front.', 'artwork-checking-mock-img', 'artwork_check_history/6vi.jpg', FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (12, 1, 'Rejected', NULL, NULL, NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (30, 1, 'Feedback added', NULL, 'Remove Serves 5 (150g)', NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (30, 1, 'Rejected', NULL, NULL, NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (18, 1, 'Feedback added', NULL, 'update to: Recycle tub, bin the film and pad.', 'artwork-checking-mock-img', 'artwork_check_history/recycling-correction.png', FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3'),
  (18, 1, 'Rejected', NULL, NULL, NULL, NULL, FALSE, '3efa0125-933f-46c1-8cef-2aa7f469dea3');


