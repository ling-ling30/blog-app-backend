PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_posts` (
	`id` text PRIMARY KEY DEFAULT 'a2407c8c-fa2c-462c-aa1e-c4a5e4d7417b' NOT NULL,
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
CREATE INDEX `statusIndex` ON `posts` (`status`);--> statement-breakpoint
CREATE TABLE `__new_post_categories` (
	`post_id` text NOT NULL,
	`category_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`post_id`, `category_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_post_categories`("post_id", "category_id", "created_at") SELECT "post_id", "category_id", "created_at" FROM `post_categories`;--> statement-breakpoint
DROP TABLE `post_categories`;--> statement-breakpoint
ALTER TABLE `__new_post_categories` RENAME TO `post_categories`;--> statement-breakpoint
CREATE TABLE `__new_post_tags` (
	`post_id` text NOT NULL,
	`tag_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`post_id`, `tag_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_post_tags`("post_id", "tag_id", "created_at") SELECT "post_id", "tag_id", "created_at" FROM `post_tags`;--> statement-breakpoint
DROP TABLE `post_tags`;--> statement-breakpoint
ALTER TABLE `__new_post_tags` RENAME TO `post_tags`;