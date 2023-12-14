--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1 (Ubuntu 15.1-1.pgdg20.04+1)
-- Dumped by pg_dump version 15.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) VALUES ('00000000-0000-0000-0000-000000000000', '01d2da54-c033-48cf-b56d-e1b9ed0dc635', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"john@example.com","user_id":"8a99fdfc-b87f-43ac-9e1c-f45a2b50f1e5","user_phone":""}}', '2023-12-14 18:44:36.605924+00', '');
INSERT INTO auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) VALUES ('00000000-0000-0000-0000-000000000000', '0409e31f-d79d-49c2-a6d8-fbaa40b7fe7b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jane@example.com","user_id":"e7907d1f-9c08-4b53-b20f-c9d9bc976975","user_phone":""}}', '2023-12-14 18:44:46.551933+00', '');
INSERT INTO auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) VALUES ('00000000-0000-0000-0000-000000000000', '5c87882c-d47d-4bb7-9f20-edcb2a867ffc', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cathy@example.com","user_id":"534e356e-e5d4-4f3c-a13a-f8373686a6c1","user_phone":""}}', '2023-12-14 18:44:58.636489+00', '');
INSERT INTO auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) VALUES ('00000000-0000-0000-0000-000000000000', '483b3cbe-93b6-499a-8a41-cef26c450c81', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"callum@example.com","user_id":"3efa0125-933f-46c1-8cef-2aa7f469dea3","user_phone":""}}', '2023-12-14 18:45:06.711454+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at) VALUES ('00000000-0000-0000-0000-000000000000', '8a99fdfc-b87f-43ac-9e1c-f45a2b50f1e5', 'authenticated', 'authenticated', 'john@example.com', '$2a$10$IFgLw6Ot7tBqeecIM0adgOOMKFdYi1rTzNIFqDZTg/RTCtlqmlv/e', '2023-12-14 18:44:36.607701+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-12-14 18:44:36.593099+00', '2023-12-14 18:44:36.60781+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at) VALUES ('00000000-0000-0000-0000-000000000000', 'e7907d1f-9c08-4b53-b20f-c9d9bc976975', 'authenticated', 'authenticated', 'jane@example.com', '$2a$10$tISLykNku1gfbknvW8mUQuCy04RJzz9dS31U0VCql5I/ARLRnwbCu', '2023-12-14 18:44:46.55467+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-12-14 18:44:46.549776+00', '2023-12-14 18:44:46.554918+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at) VALUES ('00000000-0000-0000-0000-000000000000', '534e356e-e5d4-4f3c-a13a-f8373686a6c1', 'authenticated', 'authenticated', 'cathy@example.com', '$2a$10$ZFTJbNJP2SzDClZ6a3eAuOPejGWqJHqiXi0IIJ8OBkh1x.qMGIxJ.', '2023-12-14 18:44:58.638781+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-12-14 18:44:58.633545+00', '2023-12-14 18:44:58.638947+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at) VALUES ('00000000-0000-0000-0000-000000000000', '3efa0125-933f-46c1-8cef-2aa7f469dea3', 'authenticated', 'authenticated', 'callum@example.com', '$2a$10$tN9YSpmaP/p0R81Qunk38.OmtlJMlXh9bQScsKYJWUuLXVVIVcg7W', '2023-12-14 18:45:06.713067+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-12-14 18:45:06.707029+00', '2023-12-14 18:45:06.713174+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) VALUES ('8a99fdfc-b87f-43ac-9e1c-f45a2b50f1e5', '8a99fdfc-b87f-43ac-9e1c-f45a2b50f1e5', '{"sub": "8a99fdfc-b87f-43ac-9e1c-f45a2b50f1e5", "email": "john@example.com", "email_verified": false, "phone_verified": false}', 'email', '2023-12-14 18:44:36.603392+00', '2023-12-14 18:44:36.603448+00', '2023-12-14 18:44:36.603448+00', 'b7d02b37-d487-43ae-badf-d5a849b03540');
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) VALUES ('e7907d1f-9c08-4b53-b20f-c9d9bc976975', 'e7907d1f-9c08-4b53-b20f-c9d9bc976975', '{"sub": "e7907d1f-9c08-4b53-b20f-c9d9bc976975", "email": "jane@example.com", "email_verified": false, "phone_verified": false}', 'email', '2023-12-14 18:44:46.55084+00', '2023-12-14 18:44:46.550865+00', '2023-12-14 18:44:46.550865+00', '107d73fa-571a-4822-a5c5-e713c35c40cc');
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) VALUES ('534e356e-e5d4-4f3c-a13a-f8373686a6c1', '534e356e-e5d4-4f3c-a13a-f8373686a6c1', '{"sub": "534e356e-e5d4-4f3c-a13a-f8373686a6c1", "email": "cathy@example.com", "email_verified": false, "phone_verified": false}', 'email', '2023-12-14 18:44:58.634745+00', '2023-12-14 18:44:58.634797+00', '2023-12-14 18:44:58.634797+00', '3fb57105-7324-4dc9-921e-0aec4e2017fc');
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) VALUES ('3efa0125-933f-46c1-8cef-2aa7f469dea3', '3efa0125-933f-46c1-8cef-2aa7f469dea3', '{"sub": "3efa0125-933f-46c1-8cef-2aa7f469dea3", "email": "callum@example.com", "email_verified": false, "phone_verified": false}', 'email', '2023-12-14 18:45:06.709351+00', '2023-12-14 18:45:06.709518+00', '2023-12-14 18:45:06.709518+00', 'b410ec65-0bda-4a07-b0b4-af6aae892bcf');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.schema_migrations (version) VALUES ('20171026211738');
INSERT INTO auth.schema_migrations (version) VALUES ('20171026211808');
INSERT INTO auth.schema_migrations (version) VALUES ('20171026211834');
INSERT INTO auth.schema_migrations (version) VALUES ('20180103212743');
INSERT INTO auth.schema_migrations (version) VALUES ('20180108183307');
INSERT INTO auth.schema_migrations (version) VALUES ('20180119214651');
INSERT INTO auth.schema_migrations (version) VALUES ('20180125194653');
INSERT INTO auth.schema_migrations (version) VALUES ('00');
INSERT INTO auth.schema_migrations (version) VALUES ('20210710035447');
INSERT INTO auth.schema_migrations (version) VALUES ('20210722035447');
INSERT INTO auth.schema_migrations (version) VALUES ('20210730183235');
INSERT INTO auth.schema_migrations (version) VALUES ('20210909172000');
INSERT INTO auth.schema_migrations (version) VALUES ('20210927181326');
INSERT INTO auth.schema_migrations (version) VALUES ('20211122151130');
INSERT INTO auth.schema_migrations (version) VALUES ('20211124214934');
INSERT INTO auth.schema_migrations (version) VALUES ('20211202183645');
INSERT INTO auth.schema_migrations (version) VALUES ('20220114185221');
INSERT INTO auth.schema_migrations (version) VALUES ('20220114185340');
INSERT INTO auth.schema_migrations (version) VALUES ('20220224000811');
INSERT INTO auth.schema_migrations (version) VALUES ('20220323170000');
INSERT INTO auth.schema_migrations (version) VALUES ('20220429102000');
INSERT INTO auth.schema_migrations (version) VALUES ('20220531120530');
INSERT INTO auth.schema_migrations (version) VALUES ('20220614074223');
INSERT INTO auth.schema_migrations (version) VALUES ('20220811173540');
INSERT INTO auth.schema_migrations (version) VALUES ('20221003041349');
INSERT INTO auth.schema_migrations (version) VALUES ('20221003041400');
INSERT INTO auth.schema_migrations (version) VALUES ('20221011041400');
INSERT INTO auth.schema_migrations (version) VALUES ('20221020193600');
INSERT INTO auth.schema_migrations (version) VALUES ('20221021073300');
INSERT INTO auth.schema_migrations (version) VALUES ('20221021082433');
INSERT INTO auth.schema_migrations (version) VALUES ('20221027105023');
INSERT INTO auth.schema_migrations (version) VALUES ('20221114143122');
INSERT INTO auth.schema_migrations (version) VALUES ('20221114143410');
INSERT INTO auth.schema_migrations (version) VALUES ('20221125140132');
INSERT INTO auth.schema_migrations (version) VALUES ('20221208132122');
INSERT INTO auth.schema_migrations (version) VALUES ('20221215195500');
INSERT INTO auth.schema_migrations (version) VALUES ('20221215195800');
INSERT INTO auth.schema_migrations (version) VALUES ('20221215195900');
INSERT INTO auth.schema_migrations (version) VALUES ('20230116124310');
INSERT INTO auth.schema_migrations (version) VALUES ('20230116124412');
INSERT INTO auth.schema_migrations (version) VALUES ('20230131181311');
INSERT INTO auth.schema_migrations (version) VALUES ('20230322519590');
INSERT INTO auth.schema_migrations (version) VALUES ('20230402418590');
INSERT INTO auth.schema_migrations (version) VALUES ('20230411005111');
INSERT INTO auth.schema_migrations (version) VALUES ('20230508135423');
INSERT INTO auth.schema_migrations (version) VALUES ('20230523124323');
INSERT INTO auth.schema_migrations (version) VALUES ('20230818113222');
INSERT INTO auth.schema_migrations (version) VALUES ('20230914180801');
INSERT INTO auth.schema_migrations (version) VALUES ('20231027141322');
INSERT INTO auth.schema_migrations (version) VALUES ('20231114161723');
INSERT INTO auth.schema_migrations (version) VALUES ('20231117164230');


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: business; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.business (id, created_at, name) OVERRIDING SYSTEM VALUE VALUES (1, '2023-12-14 18:42:24.519927+00', 'PM Fresh');
INSERT INTO public.business (id, created_at, name) OVERRIDING SYSTEM VALUE VALUES (2, '2023-12-14 18:42:24.519927+00', 'Nuzest');


--
-- Data for Name: market_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.market_group (id, created_at, name, business_id) OVERRIDING SYSTEM VALUE VALUES (1, '2023-12-14 18:42:24.519927+00', 'Aus/NZ PM Fresh', 1);
INSERT INTO public.market_group (id, created_at, name, business_id) OVERRIDING SYSTEM VALUE VALUES (2, '2023-12-14 18:42:24.519927+00', 'USA/CAN PM Fresh', 1);
INSERT INTO public.market_group (id, created_at, name, business_id) OVERRIDING SYSTEM VALUE VALUES (3, '2023-12-14 18:42:24.519927+00', 'Aus/NZ Nuzest', 2);
INSERT INTO public.market_group (id, created_at, name, business_id) OVERRIDING SYSTEM VALUE VALUES (4, '2023-12-14 18:42:24.519927+00', 'USA/CAN Nuzest', 2);


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.product (id, created_at, title, business_id) OVERRIDING SYSTEM VALUE VALUES (1, '2023-12-14 18:42:24.519927+00', 'Fruit Salad Watermelon Fingers', 1);


--
-- Data for Name: market_article; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.market_article (id, created_at, product_id, market_group_id) OVERRIDING SYSTEM VALUE VALUES (1, '2023-12-14 18:42:24.519927+00', 1, 1);


--
-- Data for Name: artwork_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.artwork_item (id, created_at, market_article_id, layer, dieline_file_bucketname, dieline_file_filepath) OVERRIDING SYSTEM VALUE VALUES (1, '2023-12-14 18:42:24.519927+00', 1, 'Single', NULL, NULL);


--
-- Data for Name: copy_element; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: copy_item; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: copy_requirement; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: artwork_check_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: artwork_version; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: country; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.country (id, created_at, name) OVERRIDING SYSTEM VALUE VALUES (1, '2023-12-14 18:42:24.519927+00', 'New Zealand');
INSERT INTO public.country (id, created_at, name) OVERRIDING SYSTEM VALUE VALUES (2, '2023-12-14 18:42:24.519927+00', 'Australia');
INSERT INTO public.country (id, created_at, name) OVERRIDING SYSTEM VALUE VALUES (3, '2023-12-14 18:42:24.519927+00', 'United States');
INSERT INTO public.country (id, created_at, name) OVERRIDING SYSTEM VALUE VALUES (4, '2023-12-14 18:42:24.519927+00', 'United Kingdom');
INSERT INTO public.country (id, created_at, name) OVERRIDING SYSTEM VALUE VALUES (5, '2023-12-14 18:42:24.519927+00', 'Canada');
INSERT INTO public.country (id, created_at, name) OVERRIDING SYSTEM VALUE VALUES (6, '2023-12-14 18:42:24.519927+00', 'China');
INSERT INTO public.country (id, created_at, name) OVERRIDING SYSTEM VALUE VALUES (7, '2023-12-14 18:42:24.519927+00', 'Japan');


--
-- Data for Name: country_on_market_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.country_on_market_group (id, created_at, market_group_id, country_id) OVERRIDING SYSTEM VALUE VALUES (1, '2023-12-14 18:42:24.519927+00', 1, 1);
INSERT INTO public.country_on_market_group (id, created_at, market_group_id, country_id) OVERRIDING SYSTEM VALUE VALUES (2, '2023-12-14 18:42:24.519927+00', 1, 2);
INSERT INTO public.country_on_market_group (id, created_at, market_group_id, country_id) OVERRIDING SYSTEM VALUE VALUES (3, '2023-12-14 18:42:24.519927+00', 2, 3);
INSERT INTO public.country_on_market_group (id, created_at, market_group_id, country_id) OVERRIDING SYSTEM VALUE VALUES (4, '2023-12-14 18:42:24.519927+00', 2, 5);
INSERT INTO public.country_on_market_group (id, created_at, market_group_id, country_id) OVERRIDING SYSTEM VALUE VALUES (5, '2023-12-14 18:42:24.519927+00', 3, 1);
INSERT INTO public.country_on_market_group (id, created_at, market_group_id, country_id) OVERRIDING SYSTEM VALUE VALUES (6, '2023-12-14 18:42:24.519927+00', 3, 2);
INSERT INTO public.country_on_market_group (id, created_at, market_group_id, country_id) OVERRIDING SYSTEM VALUE VALUES (7, '2023-12-14 18:42:24.519927+00', 4, 3);
INSERT INTO public.country_on_market_group (id, created_at, market_group_id, country_id) OVERRIDING SYSTEM VALUE VALUES (8, '2023-12-14 18:42:24.519927+00', 4, 5);


--
-- Data for Name: project_role; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: artwork_check_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.artwork_check_history_id_seq', 1, false);


--
-- Name: artwork_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.artwork_item_id_seq', 1, true);


--
-- Name: artwork_version_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.artwork_version_id_seq', 1, false);


--
-- Name: business_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.business_id_seq', 2, true);


--
-- Name: copy_element_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.copy_element_id_seq', 1, false);


--
-- Name: copy_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.copy_item_id_seq', 1, false);


--
-- Name: copy_requirement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.copy_requirement_id_seq', 1, false);


--
-- Name: country_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.country_id_seq', 7, true);


--
-- Name: country_on_market_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.country_on_market_group_id_seq', 8, true);


--
-- Name: market_article_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.market_article_id_seq', 1, true);


--
-- Name: market_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.market_group_id_seq', 4, true);


--
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_id_seq', 1, true);


--
-- Name: project_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_role_id_seq', 1, false);


--
-- Name: staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

