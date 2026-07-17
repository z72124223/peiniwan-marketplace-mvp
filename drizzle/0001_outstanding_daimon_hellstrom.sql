ALTER TABLE `provider_applications` ADD `external_contact` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `provider_applications` ADD `profile_photo_url` text;--> statement-breakpoint
ALTER TABLE `provider_applications` ADD `voice_sample_url` text;--> statement-breakpoint
ALTER TABLE `provider_applications` ADD `skill_proof_note` text;