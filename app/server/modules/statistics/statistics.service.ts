import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "../../db/db";
import { backupHistoryTable, backupSchedulesTable } from "../../db/schema";

const getBackupStatistics = async (days = 30) => {
	const since = Date.now() - (days * 24 * 60 * 60 * 1000);

	const statistics = await db.query.backupHistoryTable.findMany({
		where: gte(backupHistoryTable.startedAt, since),
		with: {
			schedule: {
				columns: {
					id: true,
					name: true,
				},
			},
		},
		orderBy: desc(backupHistoryTable.startedAt),
	});

	// Group by schedule and calculate aggregates
	const scheduleStats = new Map();

	for (const stat of statistics) {
		const scheduleId = stat.scheduleId;
		if (!scheduleStats.has(scheduleId)) {
			scheduleStats.set(scheduleId, {
				scheduleId,
				scheduleName: stat.schedule.name,
				totalBackups: 0,
				successfulBackups: 0,
				failedBackups: 0,
				warningBackups: 0,
				totalDuration: 0,
				averageDuration: 0,
				totalBytes: 0,
				averageBytes: 0,
				lastBackup: null as any,
				backups: [] as any[],
			});
		}

		const scheduleStat = scheduleStats.get(scheduleId)!;
		scheduleStat.totalBackups++;
		scheduleStat.totalDuration += stat.duration;
		scheduleStat.totalBytes += stat.totalBytes;

		if (stat.status === "success") {
			scheduleStat.successfulBackups++;
		} else if (stat.status === "error") {
			scheduleStat.failedBackups++;
		} else if (stat.status === "warning") {
			scheduleStat.warningBackups++;
		}

		scheduleStat.backups.push({
			id: stat.id,
			startedAt: stat.startedAt,
			completedAt: stat.completedAt,
			duration: stat.duration,
			totalBytes: stat.totalBytes,
			totalFiles: stat.totalFiles,
			status: stat.status,
			error: stat.error,
		});
	}

	// Calculate averages and set last backup
	for (const stat of scheduleStats.values()) {
		stat.averageDuration = stat.totalBackups > 0 ? Math.round(stat.totalDuration / stat.totalBackups) : 0;
		stat.averageBytes = stat.totalBackups > 0 ? Math.round(stat.totalBytes / stat.totalBackups) : 0;
		stat.lastBackup = stat.backups[0] || null;
	}

	return Array.from(scheduleStats.values());
};

const getBackupHistory = async (scheduleId?: number, limit = 50) => {
	const whereClause = scheduleId ? eq(backupHistoryTable.scheduleId, scheduleId) : undefined;

	const history = await db.query.backupHistoryTable.findMany({
		where: whereClause,
		with: {
			schedule: {
				columns: {
					id: true,
					name: true,
				},
			},
		},
		orderBy: desc(backupHistoryTable.startedAt),
		limit,
	});

	return history.map(h => ({
		id: h.id,
		scheduleId: h.scheduleId,
		scheduleName: h.schedule.name,
		snapshotId: h.snapshotId,
		startedAt: h.startedAt,
		completedAt: h.completedAt,
		duration: h.duration,
		totalBytes: h.totalBytes,
		totalFiles: h.totalFiles,
		filesNew: h.filesNew,
		filesChanged: h.filesChanged,
		filesUnmodified: h.filesUnmodified,
		dirsNew: h.dirsNew,
		dirsChanged: h.dirsChanged,
		dirsUnmodified: h.dirsUnmodified,
		dataBlobs: h.dataBlobs,
		treeBlobs: h.treeBlobs,
		dataAdded: h.dataAdded,
		status: h.status,
		error: h.error,
	}));
};

export const statisticsService = {
	getBackupStatistics,
	getBackupHistory,
};
