CREATE TABLE `provider_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`shift_id` text NOT NULL,
	`player_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`provider_service_id` text NOT NULL,
	`player_wallet_account_id` text NOT NULL,
	`hold_entry_id` text NOT NULL,
	`release_entry_id` text,
	`order_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`points_amount` integer NOT NULL,
	`twd_minor_per_point_snapshot` integer DEFAULT 100 NOT NULL,
	`expires_at` text NOT NULL,
	`accepted_at` text,
	`resolved_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`shift_id`) REFERENCES `provider_shifts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_service_id`) REFERENCES `provider_services`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_wallet_account_id`) REFERENCES `wallet_credit_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`hold_entry_id`) REFERENCES `wallet_credit_entries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`release_entry_id`) REFERENCES `wallet_credit_entries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "provider_invitations_points_positive" CHECK("provider_invitations"."points_amount" > 0),
	CONSTRAINT "provider_invitations_rate_positive" CHECK("provider_invitations"."twd_minor_per_point_snapshot" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provider_invitations_pending_provider_idx` ON `provider_invitations` (`provider_id`) WHERE "provider_invitations"."status" = 'pending';--> statement-breakpoint
CREATE INDEX `provider_invitations_provider_status_idx` ON `provider_invitations` (`provider_id`,`status`,`expires_at`);--> statement-breakpoint
CREATE INDEX `provider_invitations_player_status_idx` ON `provider_invitations` (`player_id`,`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `provider_shifts` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`status` text DEFAULT 'online' NOT NULL,
	`clocked_in_at` text NOT NULL,
	`clocked_out_at` text,
	`ended_reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provider_shifts_active_provider_idx` ON `provider_shifts` (`provider_id`) WHERE "provider_shifts"."status" = 'online';--> statement-breakpoint
CREATE INDEX `provider_shifts_provider_time_idx` ON `provider_shifts` (`provider_id`,`clocked_in_at`);--> statement-breakpoint
UPDATE `provider_profiles`
SET `online_status` = 'offline', `updated_at` = CURRENT_TIMESTAMP;--> statement-breakpoint
INSERT INTO `wallet_credit_accounts`
  (`id`, `owner_type`, `owner_key`, `owner_user_id`, `backing_currency`, `available_points`, `status`)
VALUES
  ('wallet_player_demo', 'player', 'player:user_player_demo', 'user_player_demo', 'TWD', 1200, 'active')
ON CONFLICT (`owner_key`, `backing_currency`) DO NOTHING;
