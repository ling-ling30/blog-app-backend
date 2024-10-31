PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_posts` (
	`id` text PRIMARY KEY DEFAULT '28ca32ae-70d3-4fdd-9e53-c025755eb070' NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`featured_image_url` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`view_count` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`published_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "title", "slug", "content", "excerpt", "featured_image_url", "status", "view_count", "created_at", "updated_at", "published_at") SELECT "id", "title", "slug", "content", "excerpt", "featured_image_url", "status", "view_count", "created_at", "updated_at", "published_at" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `slugIndex` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `titleIndex` ON `posts` (`title`);--> statement-breakpoint
CREATE INDEX `statusIndex` ON `posts` (`status`);