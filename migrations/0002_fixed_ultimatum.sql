CREATE INDEX `categories_name_idx` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_idx` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `categories_created_at_idx` ON `categories` (`created_at`);