import { type } from "arktype";

export const getBackupStatisticsQuerySchema = type({
	"days?": "number",
});

export type GetBackupStatisticsQuery = typeof getBackupStatisticsQuerySchema.infer;

export const getBackupHistoryQuerySchema = type({
	"scheduleId?": "number",
	"limit?": "number",
});

export type GetBackupHistoryQuery = typeof getBackupHistoryQuerySchema.infer;

export const backupHistoryResponseSchema = type({
	id: "number",
	scheduleId: "number",
	scheduleName: "string",
	snapshotId: "string",
	startedAt: "number",
	completedAt: "number",
	duration: "number",
	totalBytes: "number",
	totalFiles: "number",
	filesNew: "number",
	filesChanged: "number",
	filesUnmodified: "number",
	dirsNew: "number",
	dirsChanged: "number",
	dirsUnmodified: "number",
	dataBlobs: "number",
	treeBlobs: "number",
	dataAdded: "number",
	status: "'success' | 'warning' | 'error'",
	"error?": "string",
});

export type BackupHistoryResponse = typeof backupHistoryResponseSchema.infer;

export const backupStatisticsResponseSchema = type({
	scheduleId: "number",
	scheduleName: "string",
	totalBackups: "number",
	successfulBackups: "number",
	failedBackups: "number",
	warningBackups: "number",
	totalDuration: "number",
	averageDuration: "number",
	totalBytes: "number",
	averageBytes: "number",
	"lastBackup?": backupHistoryResponseSchema.or(type("null")),
	backups: backupHistoryResponseSchema.array(),
});

export type BackupStatisticsResponse = typeof backupStatisticsResponseSchema.infer;
