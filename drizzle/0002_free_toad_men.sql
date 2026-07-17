CREATE TABLE `ledger_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_key` text NOT NULL,
	`provider_id` text,
	`account_code` text NOT NULL,
	`currency` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ledger_accounts_owner_code_currency_idx` ON `ledger_accounts` (`owner_key`,`account_code`,`currency`);--> statement-breakpoint
CREATE INDEX `ledger_accounts_provider_idx` ON `ledger_accounts` (`provider_id`,`status`);--> statement-breakpoint
CREATE TABLE `ledger_postings` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`account_id` text NOT NULL,
	`direction` text NOT NULL,
	`amount_minor` integer NOT NULL,
	`currency` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `ledger_transactions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `ledger_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ledger_postings_amount_positive" CHECK("ledger_postings"."amount_minor" > 0)
);
--> statement-breakpoint
CREATE INDEX `ledger_postings_transaction_idx` ON `ledger_postings` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `ledger_postings_account_idx` ON `ledger_postings` (`account_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `ledger_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`reference_type` text NOT NULL,
	`reference_id` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`reversal_of_transaction_id` text,
	`description` text NOT NULL,
	`posted_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ledger_transactions_idempotency_idx` ON `ledger_transactions` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `ledger_transactions_reference_idx` ON `ledger_transactions` (`reference_type`,`reference_id`);--> statement-breakpoint
CREATE INDEX `ledger_transactions_posted_at_idx` ON `ledger_transactions` (`posted_at`);--> statement-breakpoint
CREATE TABLE `provider_point_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`balance_points` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "provider_point_accounts_balance_nonnegative" CHECK("provider_point_accounts"."balance_points" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provider_point_accounts_provider_idx` ON `provider_point_accounts` (`provider_id`);--> statement-breakpoint
CREATE TABLE `provider_point_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`delta_points` integer NOT NULL,
	`balance_after_points` integer NOT NULL,
	`reason` text NOT NULL,
	`reference_type` text NOT NULL,
	`reference_id` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`reversal_of_entry_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `provider_point_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "provider_point_entries_delta_nonzero" CHECK("provider_point_entries"."delta_points" <> 0),
	CONSTRAINT "provider_point_entries_balance_nonnegative" CHECK("provider_point_entries"."balance_after_points" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provider_point_entries_idempotency_idx` ON `provider_point_entries` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `provider_point_entries_account_idx` ON `provider_point_entries` (`account_id`,`created_at`);