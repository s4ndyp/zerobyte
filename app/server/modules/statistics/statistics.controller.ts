import { Hono } from "hono";
import { statisticsService } from "./statistics.service";
import type { GetBackupStatisticsQuery, GetBackupHistoryQuery } from "./statistics.dto";

const router = new Hono();

router.get("/backup-statistics", async (c) => {
	const query = c.req.query();
	const days = query.days ? parseInt(query.days) : 30;

	const statistics = await statisticsService.getBackupStatistics(days);
	return c.json(statistics);
});

router.get("/backup-history", async (c) => {
	const query = c.req.query();
	const scheduleId = query.scheduleId ? parseInt(query.scheduleId) : undefined;
	const limit = query.limit ? parseInt(query.limit) : 50;

	const history = await statisticsService.getBackupHistory(scheduleId, limit);
	return c.json(history);
});

export { router as statisticsController };

