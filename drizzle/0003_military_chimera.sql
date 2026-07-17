CREATE TABLE `wallet_credit_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_type` text NOT NULL,
	`owner_key` text NOT NULL,
	`owner_user_id` text,
	`provider_id` text,
	`backing_currency` text DEFAULT 'TWD' NOT NULL,
	`available_points` integer DEFAULT 0 NOT NULL,
	`held_points` integer DEFAULT 0 NOT NULL,
	`pending_points` integer DEFAULT 0 NOT NULL,
	`redeemable_points` integer DEFAULT 0 NOT NULL,
	`frozen_points` integer DEFAULT 0 NOT NULL,
	`lifetime_redeemed_points` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "wallet_credit_accounts_available_nonnegative" CHECK("wallet_credit_accounts"."available_points" >= 0),
	CONSTRAINT "wallet_credit_accounts_held_nonnegative" CHECK("wallet_credit_accounts"."held_points" >= 0),
	CONSTRAINT "wallet_credit_accounts_pending_nonnegative" CHECK("wallet_credit_accounts"."pending_points" >= 0),
	CONSTRAINT "wallet_credit_accounts_redeemable_nonnegative" CHECK("wallet_credit_accounts"."redeemable_points" >= 0),
	CONSTRAINT "wallet_credit_accounts_frozen_nonnegative" CHECK("wallet_credit_accounts"."frozen_points" >= 0),
	CONSTRAINT "wallet_credit_accounts_lifetime_redeemed_nonnegative" CHECK("wallet_credit_accounts"."lifetime_redeemed_points" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wallet_credit_accounts_owner_currency_idx` ON `wallet_credit_accounts` (`owner_key`,`backing_currency`);--> statement-breakpoint
CREATE INDEX `wallet_credit_accounts_user_idx` ON `wallet_credit_accounts` (`owner_user_id`,`status`);--> statement-breakpoint
CREATE INDEX `wallet_credit_accounts_provider_idx` ON `wallet_credit_accounts` (`provider_id`,`status`);--> statement-breakpoint
CREATE TABLE `wallet_credit_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`event_type` text NOT NULL,
	`points_amount` integer NOT NULL,
	`available_delta_points` integer DEFAULT 0 NOT NULL,
	`held_delta_points` integer DEFAULT 0 NOT NULL,
	`pending_delta_points` integer DEFAULT 0 NOT NULL,
	`redeemable_delta_points` integer DEFAULT 0 NOT NULL,
	`frozen_delta_points` integer DEFAULT 0 NOT NULL,
	`available_after_points` integer NOT NULL,
	`held_after_points` integer NOT NULL,
	`pending_after_points` integer NOT NULL,
	`redeemable_after_points` integer NOT NULL,
	`frozen_after_points` integer NOT NULL,
	`twd_value_minor` integer NOT NULL,
	`twd_minor_per_point_snapshot` integer NOT NULL,
	`reference_type` text NOT NULL,
	`reference_id` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`rule_version` text,
	`reason` text NOT NULL,
	`reversal_of_entry_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `wallet_credit_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "wallet_credit_entries_points_positive" CHECK("wallet_credit_entries"."points_amount" > 0),
	CONSTRAINT "wallet_credit_entries_twd_value_nonnegative" CHECK("wallet_credit_entries"."twd_value_minor" >= 0),
	CONSTRAINT "wallet_credit_entries_rate_positive" CHECK("wallet_credit_entries"."twd_minor_per_point_snapshot" > 0),
	CONSTRAINT "wallet_credit_entries_has_delta" CHECK("wallet_credit_entries"."available_delta_points" <> 0 OR "wallet_credit_entries"."held_delta_points" <> 0 OR "wallet_credit_entries"."pending_delta_points" <> 0 OR "wallet_credit_entries"."redeemable_delta_points" <> 0 OR "wallet_credit_entries"."frozen_delta_points" <> 0),
	CONSTRAINT "wallet_credit_entries_available_nonnegative" CHECK("wallet_credit_entries"."available_after_points" >= 0),
	CONSTRAINT "wallet_credit_entries_held_nonnegative" CHECK("wallet_credit_entries"."held_after_points" >= 0),
	CONSTRAINT "wallet_credit_entries_pending_nonnegative" CHECK("wallet_credit_entries"."pending_after_points" >= 0),
	CONSTRAINT "wallet_credit_entries_redeemable_nonnegative" CHECK("wallet_credit_entries"."redeemable_after_points" >= 0),
	CONSTRAINT "wallet_credit_entries_frozen_nonnegative" CHECK("wallet_credit_entries"."frozen_after_points" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wallet_credit_entries_idempotency_idx` ON `wallet_credit_entries` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `wallet_credit_entries_account_idx` ON `wallet_credit_entries` (`account_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `wallet_credit_entries_reference_idx` ON `wallet_credit_entries` (`reference_type`,`reference_id`);