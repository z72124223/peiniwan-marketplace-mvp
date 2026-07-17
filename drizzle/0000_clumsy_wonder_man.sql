CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`previous_value_json` text,
	`next_value_json` text,
	`reason` text,
	`request_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `availability_slots` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`time_zone` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `availability_provider_time_idx` ON `availability_slots` (`provider_id`,`starts_at`);--> statement-breakpoint
CREATE TABLE `commission_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`acquisition_source` text NOT NULL,
	`region_code` text,
	`platform_fee_rate_bps` integer NOT NULL,
	`first_completed_order_limit` integer,
	`effective_from` text NOT NULL,
	`effective_to` text,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`region_code`) REFERENCES `regions`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `commission_rules_lookup_idx` ON `commission_rules` (`acquisition_source`,`region_code`,`enabled`);--> statement-breakpoint
CREATE TABLE `concierge_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text,
	`contact_name` text NOT NULL,
	`contact_method` text NOT NULL,
	`region_code` text NOT NULL,
	`game_id` text,
	`preferred_gender` text,
	`preferred_persona_tags` text DEFAULT '[]' NOT NULL,
	`preferred_voice_tags` text DEFAULT '[]' NOT NULL,
	`service_axis` text NOT NULL,
	`budget_min_minor` integer,
	`budget_max_minor` integer,
	`currency` text NOT NULL,
	`requested_start_at` text NOT NULL,
	`requested_duration_minutes` integer NOT NULL,
	`notes` text NOT NULL,
	`age_confirmed` integer NOT NULL,
	`owner_status` text DEFAULT 'new' NOT NULL,
	`matched_provider_id` text,
	`converted_order_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`region_code`) REFERENCES `regions`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`matched_provider_id`) REFERENCES `provider_profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`converted_order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `concierge_owner_queue_idx` ON `concierge_requests` (`owner_status`,`created_at`);--> statement-breakpoint
CREATE TABLE `dispute_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`dispute_id` text NOT NULL,
	`submitted_by_user_id` text,
	`storage_key` text NOT NULL,
	`content_type` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`dispute_id`) REFERENCES `disputes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `dispute_evidence_dispute_idx` ON `dispute_evidence` (`dispute_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `disputes` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`support_case_id` text,
	`opened_by_user_id` text,
	`reason` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`payout_frozen` integer DEFAULT true NOT NULL,
	`resolution` text,
	`resolved_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`support_case_id`) REFERENCES `support_cases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`opened_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `disputes_queue_idx` ON `disputes` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `favorites` (
	`player_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`player_id`, `provider_id`),
	FOREIGN KEY (`player_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `game_servers` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`region_code` text,
	`name` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`region_code`) REFERENCES `regions`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_servers_game_name_idx` ON `game_servers` (`game_id`,`name`);--> statement-breakpoint
CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`display_name` text NOT NULL,
	`display_name_zh_cn` text,
	`category` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `games_slug_idx` ON `games` (`slug`);--> statement-breakpoint
CREATE TABLE `moderation_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`target_user_id` text,
	`provider_service_id` text,
	`dispute_id` text,
	`action_type` text NOT NULL,
	`reason` text NOT NULL,
	`created_by_user_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_service_id`) REFERENCES `provider_services`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dispute_id`) REFERENCES `disputes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `moderation_actions_target_idx` ON `moderation_actions` (`target_user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`provider_service_id` text NOT NULL,
	`region_code` text NOT NULL,
	`requested_start_at` text NOT NULL,
	`requested_duration_minutes` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`acquisition_source` text NOT NULL,
	`currency` text NOT NULL,
	`gross_amount_minor` integer NOT NULL,
	`platform_fee_rate_bps_snapshot` integer NOT NULL,
	`platform_fee_amount_minor_snapshot` integer NOT NULL,
	`payment_processing_fee_minor_snapshot` integer NOT NULL,
	`provider_net_amount_minor_snapshot` integer NOT NULL,
	`payment_reference` text,
	`external_voice_contact` text,
	`completed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_service_id`) REFERENCES `provider_services`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`region_code`) REFERENCES `regions`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `orders_player_idx` ON `orders` (`player_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_provider_idx` ON `orders` (`provider_id`,`status`,`requested_start_at`);--> statement-breakpoint
CREATE TABLE `owner_presence` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`status` text DEFAULT 'offline' NOT NULL,
	`status_message` text,
	`expected_response_minutes` integer,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pricing_suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`region_code` text NOT NULL,
	`game_id` text,
	`service_axis` text NOT NULL,
	`billing_unit` text NOT NULL,
	`minimum_suggested_amount_minor` integer NOT NULL,
	`maximum_suggested_amount_minor` integer NOT NULL,
	`currency` text NOT NULL,
	`effective_from` text NOT NULL,
	`effective_to` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`region_code`) REFERENCES `regions`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `pricing_suggestions_lookup_idx` ON `pricing_suggestions` (`region_code`,`game_id`,`service_axis`);--> statement-breakpoint
CREATE TABLE `provider_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`applicant_name` text NOT NULL,
	`email` text NOT NULL,
	`region_code` text NOT NULL,
	`public_gender` text NOT NULL,
	`service_axes` text DEFAULT '[]' NOT NULL,
	`game_ids` text DEFAULT '[]' NOT NULL,
	`persona_tags` text DEFAULT '[]' NOT NULL,
	`biography` text NOT NULL,
	`age_confirmed` integer NOT NULL,
	`policy_accepted_at` text NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`review_notes` text,
	`reviewed_at` text,
	`submitted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`region_code`) REFERENCES `regions`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `provider_applications_status_idx` ON `provider_applications` (`status`,`submitted_at`);--> statement-breakpoint
CREATE TABLE `provider_game_skills` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`game_id` text NOT NULL,
	`server_id` text,
	`rank` text,
	`skill_proof_files` text DEFAULT '[]' NOT NULL,
	`skill_verification_status` text DEFAULT 'not_required' NOT NULL,
	`coaching_supported` integer DEFAULT false NOT NULL,
	`result_guarantee_policy` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`server_id`) REFERENCES `game_servers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provider_game_skills_unique_idx` ON `provider_game_skills` (`provider_id`,`game_id`,`server_id`);--> statement-breakpoint
CREATE TABLE `provider_media` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`media_type` text NOT NULL,
	`storage_key` text NOT NULL,
	`public_url` text,
	`content_type` text NOT NULL,
	`verification_status` text DEFAULT 'pending' NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `provider_media_provider_type_idx` ON `provider_media` (`provider_id`,`media_type`);--> statement-breakpoint
CREATE TABLE `provider_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`application_id` text,
	`display_name` text NOT NULL,
	`public_gender` text NOT NULL,
	`primary_photo_url` text NOT NULL,
	`photo_verification_status` text DEFAULT 'pending' NOT NULL,
	`voice_sample_url` text,
	`voice_verification_status` text DEFAULT 'pending' NOT NULL,
	`voice_tags` text DEFAULT '[]' NOT NULL,
	`persona_tags` text DEFAULT '[]' NOT NULL,
	`interaction_style_tags` text DEFAULT '[]' NOT NULL,
	`emotional_strength` integer DEFAULT 0 NOT NULL,
	`technical_strength` integer DEFAULT 0 NOT NULL,
	`biography` text NOT NULL,
	`languages` text DEFAULT '[]' NOT NULL,
	`regions` text DEFAULT '[]' NOT NULL,
	`online_status` text DEFAULT 'offline' NOT NULL,
	`last_active_at` text,
	`response_time_minutes` integer,
	`featured` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`application_id`) REFERENCES `provider_applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provider_profiles_user_idx` ON `provider_profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `provider_profiles_discovery_idx` ON `provider_profiles` (`status`,`online_status`,`featured`);--> statement-breakpoint
CREATE TABLE `provider_services` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`category_key` text NOT NULL,
	`game_id` text,
	`service_axis` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`billing_unit` text NOT NULL,
	`price_amount_minor` integer NOT NULL,
	`currency` text NOT NULL,
	`package_details` text,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_key`) REFERENCES `service_categories`(`key`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `provider_services_discovery_idx` ON `provider_services` (`enabled`,`service_axis`,`game_id`);--> statement-breakpoint
CREATE TABLE `region_policies` (
	`id` text PRIMARY KEY NOT NULL,
	`region_code` text NOT NULL,
	`minimum_age` integer DEFAULT 18 NOT NULL,
	`allowed_category_keys` text DEFAULT '[]' NOT NULL,
	`kyc_required` integer DEFAULT true NOT NULL,
	`transaction_retention_days` integer DEFAULT 1095 NOT NULL,
	`payment_adapter` text NOT NULL,
	`identity_adapter` text NOT NULL,
	`storage_adapter` text NOT NULL,
	`captcha_adapter` text NOT NULL,
	`notification_adapter` text NOT NULL,
	`messaging_adapter` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`region_code`) REFERENCES `regions`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `region_policies_region_idx` ON `region_policies` (`region_code`);--> statement-breakpoint
CREATE TABLE `regions` (
	`code` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`default_locale` text NOT NULL,
	`currency` text NOT NULL,
	`time_zone` text NOT NULL,
	`data_plane` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`support_case_id` text,
	`reporter_user_id` text,
	`reported_user_id` text,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`duplicate_group_key` text,
	`status` text DEFAULT 'submitted' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`support_case_id`) REFERENCES `support_cases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reporter_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reported_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reports_status_idx` ON `reports` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`player_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`emotional_value_score` integer,
	`technical_skill_score` integer,
	`communication_score` integer NOT NULL,
	`punctuality_score` integer NOT NULL,
	`description_accuracy_score` integer NOT NULL,
	`overall_score` integer NOT NULL,
	`comment` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_order_idx` ON `reviews` (`order_id`);--> statement-breakpoint
CREATE TABLE `service_categories` (
	`key` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`minimum_age` integer DEFAULT 18 NOT NULL,
	`allowed_regions` text DEFAULT '[]' NOT NULL,
	`risk_level` text NOT NULL,
	`requires_game` integer DEFAULT false NOT NULL,
	`requires_skill_proof` integer DEFAULT false NOT NULL,
	`allows_voice_sample` integer DEFAULT true NOT NULL,
	`moderation_rules` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `staff_role_permissions` (
	`staff_role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	PRIMARY KEY(`staff_role_id`, `permission_id`),
	FOREIGN KEY (`staff_role_id`) REFERENCES `staff_roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `staff_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`display_name` text NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `support_cases` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text,
	`opened_by_user_id` text,
	`case_type` text NOT NULL,
	`description` text NOT NULL,
	`external_contact` text,
	`risk_level` text DEFAULT 'low' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`owner_notes` text,
	`due_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`opened_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `support_cases_queue_idx` ON `support_cases` (`status`,`risk_level`,`created_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`region_code` text NOT NULL,
	`email` text,
	`display_name` text NOT NULL,
	`age_verified_at` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`region_code`) REFERENCES `regions`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_status_idx` ON `users` (`role`,`status`);
--> statement-breakpoint
INSERT INTO `regions` (`code`, `display_name`, `default_locale`, `currency`, `time_zone`, `data_plane`, `enabled`) VALUES
  ('TW', '台灣', 'zh-TW', 'TWD', 'Asia/Taipei', 'global', 1),
  ('GLOBAL', '全球', 'zh-TW', 'USD', 'UTC', 'global', 1),
  ('CN', '中國大陸（資料模型預留）', 'zh-CN', 'CNY', 'Asia/Shanghai', 'cn', 0);
--> statement-breakpoint
INSERT INTO `region_policies` (`id`, `region_code`, `minimum_age`, `allowed_category_keys`, `kyc_required`, `transaction_retention_days`, `payment_adapter`, `identity_adapter`, `storage_adapter`, `captcha_adapter`, `notification_adapter`, `messaging_adapter`) VALUES
  ('policy_tw', 'TW', 18, '["game_entertainment","game_coaching","ranked_companion","voice_chat","listening","movie_companion","wake_up","good_night","cp_roleplay","custom_service"]', 1, 1095, 'not_configured', 'not_configured', 'r2_media', 'not_configured', 'not_configured', 'not_configured'),
  ('policy_global', 'GLOBAL', 18, '["game_entertainment","game_coaching","ranked_companion","voice_chat","listening","movie_companion","wake_up","good_night","cp_roleplay","custom_service"]', 1, 1095, 'not_configured', 'not_configured', 'r2_media', 'not_configured', 'not_configured', 'not_configured'),
  ('policy_cn', 'CN', 18, '[]', 1, 1095, 'cn_partner_required', 'cn_partner_required', 'cn_local_storage_required', 'cn_local_required', 'cn_local_required', 'cn_local_required');
--> statement-breakpoint
INSERT INTO `games` (`id`, `slug`, `display_name`, `display_name_zh_cn`, `category`, `enabled`, `sort_order`) VALUES
  ('game_lol', 'league-of-legends', '英雄聯盟', '英雄联盟', 'MOBA', 1, 10),
  ('game_valorant', 'valorant', '特戰英豪', '无畏契约', 'FPS', 1, 20),
  ('game_wildrift', 'wild-rift', '英雄聯盟：激鬥峽谷', '英雄联盟手游', 'MOBA', 1, 30);
--> statement-breakpoint
INSERT INTO `game_servers` (`id`, `game_id`, `region_code`, `name`, `enabled`) VALUES
  ('server_lol_tw', 'game_lol', 'TW', '台港澳服', 1),
  ('server_val_tw', 'game_valorant', 'TW', '台港服', 1),
  ('server_wildrift_tw', 'game_wildrift', 'TW', '台港澳服', 1);
--> statement-breakpoint
INSERT INTO `service_categories` (`key`, `display_name`, `minimum_age`, `allowed_regions`, `risk_level`, `requires_game`, `requires_skill_proof`, `allows_voice_sample`, `moderation_rules`, `enabled`, `sort_order`) VALUES
  ('game_entertainment', '遊戲娛樂陪玩', 18, '["TW","GLOBAL"]', 'low', 1, 0, 1, '禁止色情、線下交易、私下收款與消費脅迫。', 1, 10),
  ('game_coaching', '技術陪練與教學', 18, '["TW","GLOBAL"]', 'low', 1, 1, 1, '不得承諾不合理上分結果，不得使用外掛、代打或帳號共享。', 1, 20),
  ('ranked_companion', '排位組隊', 18, '["TW","GLOBAL"]', 'medium', 1, 1, 1, '不得代打、共享帳號或保證必定上分。', 1, 30),
  ('voice_chat', '語音聊天', 18, '["TW","GLOBAL"]', 'medium', 0, 0, 1, '禁止裸聊、色情語音、戀愛承諾誘導與未經同意錄音。', 1, 40),
  ('listening', '傾聽陪伴', 18, '["TW","GLOBAL"]', 'medium', 0, 0, 1, '不得冒充心理治療或危機處置專業服務。', 1, 50),
  ('singing', '唱歌／才藝點播', 18, '["TW","GLOBAL"]', 'high', 0, 0, 1, '本版僅允許一對一外部通訊，不提供公開表演或直播。', 0, 60),
  ('movie_companion', '共同看片／線上活動', 18, '["TW","GLOBAL"]', 'medium', 0, 0, 1, '不得散播未授權內容；服務僅提供陪伴，不提供影音來源。', 1, 70),
  ('wake_up', '鬧鐘陪伴', 18, '["TW","GLOBAL"]', 'medium', 0, 0, 1, '不得要求住址、定位或其他非必要敏感資訊。', 1, 80),
  ('good_night', '晚安陪伴', 18, '["TW","GLOBAL"]', 'medium', 0, 0, 1, '不得轉為色情、情緒勒索或真實交往承諾。', 1, 90),
  ('cp_roleplay', 'CP 氛圍角色互動', 18, '["TW","GLOBAL"]', 'high', 0, 0, 1, '必須揭露為角色式服務；禁止性交易、線下承諾與消費脅迫。', 1, 100),
  ('custom_service', '自訂合法服務', 18, '["TW","GLOBAL"]', 'high', 0, 0, 1, '上架前由 Owner 逐筆人工審核。', 1, 110);
--> statement-breakpoint
INSERT INTO `users` (`id`, `role`, `region_code`, `email`, `display_name`, `age_verified_at`, `status`) VALUES
  ('user_owner', 'owner', 'TW', 'owner-demo@example.invalid', '站長', '2026-07-01T00:00:00+08:00', 'active'),
  ('user_player_demo', 'player', 'TW', 'player-demo@example.invalid', '小葵', '2026-07-01T00:00:00+08:00', 'active'),
  ('user_provider_an', 'provider', 'TW', NULL, '小安', '2026-07-01T00:00:00+08:00', 'active'),
  ('user_provider_zhe', 'provider', 'TW', NULL, '阿哲', '2026-07-01T00:00:00+08:00', 'active'),
  ('user_provider_yu', 'provider', 'TW', NULL, '雨晴', '2026-07-01T00:00:00+08:00', 'active'),
  ('user_provider_mu', 'provider', 'TW', NULL, '夏木', '2026-07-01T00:00:00+08:00', 'active'),
  ('user_provider_kai', 'provider', 'TW', NULL, '凱文', '2026-07-01T00:00:00+08:00', 'active'),
  ('user_provider_lin', 'provider', 'TW', NULL, '琳琳', '2026-07-01T00:00:00+08:00', 'active');
--> statement-breakpoint
INSERT INTO `provider_applications` (`id`, `applicant_name`, `email`, `region_code`, `public_gender`, `service_axes`, `game_ids`, `persona_tags`, `biography`, `age_confirmed`, `policy_accepted_at`, `status`, `review_notes`) VALUES
  ('app_001', 'Mina', 'mina-demo@example.invalid', 'TW', 'female', '["emotional"]', '["game_lol"]', '["甜聲","新手友善"]', '示範申請資料，等待 Owner 人工審核。', 1, '2026-07-17T16:20:00+08:00', 'submitted', NULL),
  ('app_002', '周周', 'zhou-demo@example.invalid', 'TW', 'female', '["hybrid"]', '["game_valorant"]', '["有梗","報點"]', '示範申請資料，需補充語音樣本。', 1, '2026-07-17T14:05:00+08:00', 'needs_changes', '請補 20–30 秒自然語音樣本。'),
  ('app_003', 'Rex', 'rex-demo@example.invalid', 'TW', 'male', '["technical"]', '["game_valorant"]', '["教練型"]', '示範申請資料，等待戰績驗證。', 1, '2026-07-16T22:48:00+08:00', 'submitted', '待驗證段位截圖。');
--> statement-breakpoint
INSERT INTO `provider_profiles` (`id`, `user_id`, `display_name`, `public_gender`, `primary_photo_url`, `photo_verification_status`, `voice_verification_status`, `voice_tags`, `persona_tags`, `interaction_style_tags`, `emotional_strength`, `technical_strength`, `biography`, `languages`, `regions`, `online_status`, `last_active_at`, `response_time_minutes`, `featured`, `status`) VALUES
  ('provider_an', 'user_provider_an', '小安', 'female', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=86', 'verified', 'verified', '["清甜","慢語速"]', '["溫柔","甜妹","新手友善"]', '["主動開話題","不催單"]', 49, 41, '很會接住話題，也尊重你想安靜的時候。', '["zh-TW"]', '["TW","GLOBAL"]', 'online', CURRENT_TIMESTAMP, 3, 1, 'active'),
  ('provider_zhe', 'user_provider_zhe', '阿哲', 'male', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=86', 'verified', 'verified', '["沉穩","清楚"]', '["冷靜","教練型","不嘴人"]', '["戰術指揮","賽後復盤"]', 43, 49, 'Immortal 段位，會先看你的習慣再給一個能立刻用的重點。', '["zh-TW"]', '["TW","GLOBAL"]', 'online', CURRENT_TIMESTAMP, 5, 1, 'active'),
  ('provider_yu', 'user_provider_yu', '雨晴', 'female', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=86', 'verified', 'verified', '["自然","微低音"]', '["自然系","有梗","社恐友善"]', '["看氣氛","穩定報點"]', 48, 46, '聊天和遊戲節奏各半，不會一直查戶口。', '["zh-TW"]', '["TW","GLOBAL"]', 'busy', CURRENT_TIMESTAMP, 12, 1, 'active'),
  ('provider_mu', 'user_provider_mu', '夏木', 'not_disclosed', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=86', 'verified', 'verified', '["輕柔","慢節奏"]', '["安靜","傾聽","低刺激"]', '["不查戶口","尊重界線"]', 49, 39, '適合不喜歡太熱鬧的人。', '["zh-TW"]', '["TW","GLOBAL"]', 'online', CURRENT_TIMESTAMP, 4, 0, 'active'),
  ('provider_kai', 'user_provider_kai', '凱文', 'male', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=86', 'verified', 'verified', '["低音","有精神"]', '["可靠","隊友感","不甩鍋"]', '["團隊溝通","主動補位"]', 46, 47, '偏團隊型的全能陪玩。', '["zh-TW"]', '["TW","GLOBAL"]', 'offline', CURRENT_TIMESTAMP, 28, 0, 'active'),
  ('provider_lin', 'user_provider_lin', '琳琳', 'female', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=86', 'verified', 'verified', '["清晰","有活力"]', '["耐心","講人話","目標導向"]', '["拆解目標","賽後筆記"]', 45, 49, '擅長把複雜觀念拆成一兩個容易練的目標。', '["zh-TW"]', '["TW","GLOBAL"]', 'online', CURRENT_TIMESTAMP, 6, 0, 'active');
--> statement-breakpoint
INSERT INTO `provider_game_skills` (`id`, `provider_id`, `game_id`, `server_id`, `rank`, `skill_proof_files`, `skill_verification_status`, `coaching_supported`, `result_guarantee_policy`) VALUES
  ('skill_an_lol', 'provider_an', 'game_lol', 'server_lol_tw', 'Platinum', '[]', 'not_required', 0, '不保證上分結果。'),
  ('skill_zhe_val', 'provider_zhe', 'game_valorant', 'server_val_tw', 'Immortal', '["demo/skill/zhe-valorant.png"]', 'verified', 1, '提供教學與復盤，不承諾必定升段。'),
  ('skill_yu_lol', 'provider_yu', 'game_lol', 'server_lol_tw', 'Diamond', '["demo/skill/yu-lol.png"]', 'verified', 0, '不保證上分結果。'),
  ('skill_mu_wr', 'provider_mu', 'game_wildrift', 'server_wildrift_tw', 'Emerald', '[]', 'not_required', 0, '休閒服務。'),
  ('skill_kai_val', 'provider_kai', 'game_valorant', 'server_val_tw', 'Ascendant', '["demo/skill/kai-valorant.png"]', 'verified', 0, '不保證上分結果。'),
  ('skill_lin_lol', 'provider_lin', 'game_lol', 'server_lol_tw', 'Master', '["demo/skill/lin-lol.png"]', 'verified', 1, '提供教學目標，不承諾必定升段。');
--> statement-breakpoint
INSERT INTO `provider_services` (`id`, `provider_id`, `category_key`, `game_id`, `service_axis`, `title`, `description`, `billing_unit`, `price_amount_minor`, `currency`, `enabled`) VALUES
  ('service_an', 'provider_an', 'game_entertainment', 'game_lol', 'emotional', '溫柔陪伴新客體驗', '30 分鐘低風險體驗，先確認互動節奏。', 'per_30_minutes', 14900, 'TWD', 1),
  ('service_zhe', 'provider_zhe', 'game_coaching', 'game_valorant', 'technical', '高端戰術復盤局', '一局實戰加重點復盤。', 'per_game', 29900, 'TWD', 1),
  ('service_yu', 'provider_yu', 'game_entertainment', 'game_lol', 'hybrid', '有梗全能局', '聊天、報點與穩定補位。', 'per_60_minutes', 39900, 'TWD', 1),
  ('service_mu', 'provider_mu', 'listening', 'game_wildrift', 'emotional', '安靜傾聽陪伴', '低刺激、不查戶口的陪伴節奏。', 'per_60_minutes', 19900, 'TWD', 1),
  ('service_kai', 'provider_kai', 'game_entertainment', 'game_valorant', 'hybrid', '可靠隊友全能局', '團隊溝通、穩定報點、不甩鍋。', 'per_60_minutes', 34900, 'TWD', 1),
  ('service_lin', 'provider_lin', 'game_coaching', 'game_lol', 'technical', '節奏教學與賽後筆記', '拆成可練的一個目標，適合新手與回鍋玩家。', 'per_60_minutes', 49900, 'TWD', 1);
--> statement-breakpoint
INSERT INTO `pricing_suggestions` (`id`, `region_code`, `game_id`, `service_axis`, `billing_unit`, `minimum_suggested_amount_minor`, `maximum_suggested_amount_minor`, `currency`, `effective_from`) VALUES
  ('price_tw_emotional_30', 'TW', NULL, 'emotional', 'per_30_minutes', 9900, 14900, 'TWD', '2026-07-17'),
  ('price_tw_emotional_60', 'TW', NULL, 'emotional', 'per_60_minutes', 19900, 49900, 'TWD', '2026-07-17'),
  ('price_tw_hybrid_60', 'TW', NULL, 'hybrid', 'per_60_minutes', 29900, 59900, 'TWD', '2026-07-17'),
  ('price_tw_technical_game', 'TW', NULL, 'technical', 'per_game', 14900, 39900, 'TWD', '2026-07-17'),
  ('price_tw_technical_60', 'TW', NULL, 'technical', 'per_60_minutes', 49900, 99900, 'TWD', '2026-07-17');
--> statement-breakpoint
INSERT INTO `commission_rules` (`id`, `acquisition_source`, `region_code`, `platform_fee_rate_bps`, `first_completed_order_limit`, `effective_from`, `enabled`) VALUES
  ('commission_first10', 'provider_first_orders', 'TW', 0, 10, '2026-07-17', 1),
  ('commission_referred', 'provider_referred', 'TW', 500, NULL, '2026-07-17', 1),
  ('commission_organic', 'organic_platform', 'TW', 1000, NULL, '2026-07-17', 1),
  ('commission_promoted', 'promoted_platform', 'TW', 1200, NULL, '2026-07-17', 1);
--> statement-breakpoint
INSERT INTO `owner_presence` (`id`, `owner_user_id`, `status`, `status_message`, `expected_response_minutes`) VALUES
  ('owner_presence_primary', 'user_owner', 'online', '有下單、退款或投訴問題？直接聯繫本人。', 10);
--> statement-breakpoint
INSERT INTO `concierge_requests` (`id`, `player_id`, `contact_name`, `contact_method`, `region_code`, `game_id`, `preferred_gender`, `preferred_persona_tags`, `preferred_voice_tags`, `service_axis`, `budget_min_minor`, `budget_max_minor`, `currency`, `requested_start_at`, `requested_duration_minutes`, `notes`, `age_confirmed`, `owner_status`) VALUES
  ('match_001', 'user_player_demo', '小葵', 'LINE demo_contact', 'TW', 'game_valorant', NULL, '["冷靜","不嘴人"]', '["沉穩"]', 'technical', 25000, 45000, 'TWD', '2026-07-18T21:30:00+08:00', 60, '想認真上分，希望有人先看問題再給建議。', 1, 'new'),
  ('match_002', NULL, 'Demo 玩家', 'Discord demo_contact', 'TW', 'game_lol', 'female', '["新手友善"]', '[]', 'emotional', 15000, 35000, 'TWD', '2026-07-19T20:00:00+08:00', 60, '第一次找陪玩，怕尷尬，希望對方會主動帶話題。', 1, 'reviewing');
--> statement-breakpoint
INSERT INTO `support_cases` (`id`, `order_id`, `opened_by_user_id`, `case_type`, `description`, `risk_level`, `status`, `owner_notes`) VALUES
  ('case_001', NULL, 'user_player_demo', 'order_help', '示範案件：需要修改預約時間。', 'low', 'open', NULL),
  ('case_002', NULL, 'user_player_demo', 'complaint', '示範案件：服務描述與實際體驗不符，等待人工查證。', 'medium', 'investigating', '不得依關鍵字自動處罰，請聯絡雙方補充證據。');
