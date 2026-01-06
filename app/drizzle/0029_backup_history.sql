CREATE TABLE `backup_history_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`schedule_id` integer NOT NULL,
	`snapshot_id` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer NOT NULL,
	`duration` integer NOT NULL,
	`total_bytes` integer NOT NULL,
	`total_files` integer NOT NULL,
	`files_new` integer NOT NULL,
	`files_changed` integer NOT NULL,
	`files_unmodified` integer NOT NULL,
	`dirs_new` integer NOT NULL,
	`dirs_changed` integer NOT NULL,
	`dirs_unmodified` integer NOT NULL,
	`data_blobs` integer NOT NULL,
	`tree_blobs` integer NOT NULL,
	`data_added` integer NOT NULL,
	`status` text NOT NULL,
	`error` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`schedule_id`) REFERENCES `backup_schedules_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `backup_history_schedule_id_idx` ON `backup_history_table` (`schedule_id`);--> statement-breakpoint
CREATE INDEX `backup_history_started_at_idx` ON `backup_history_table` (`started_at`);--> statement-breakpoint
