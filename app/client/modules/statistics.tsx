import { useQuery } from "@tanstack/react-query";
import { BarChart3, Clock, HardDrive } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/client/components/ui/card";
import { Badge } from "~/client/components/ui/badge";
import { Separator } from "~/client/components/ui/separator";
import { BytesSize } from "~/client/components/bytes-size";
import { EmptyState } from "~/client/components/empty-state";
import type { Route } from "./+types/statistics";

export const handle = {
	breadcrumb: () => [{ label: "Statistieken" }],
};

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "Zerobyte - Backup Statistieken" },
		{
			name: "description",
			content: "Bekijk statistieken van backup jobs inclusief duur en gegevensoverdracht.",
		},
	];
}

// Temporary API call functions until API client is regenerated
const fetchBackupStatistics = async () => {
	const response = await fetch("/api/v1/statistics/backup-statistics");
	if (!response.ok) throw new Error("Failed to fetch statistics");
	return response.json();
};

const fetchBackupHistory = async (scheduleId?: number) => {
	const params = scheduleId ? `?scheduleId=${scheduleId}&limit=10` : "?limit=10";
	const response = await fetch(`/api/v1/statistics/backup-history${params}`);
	if (!response.ok) throw new Error("Failed to fetch history");
	return response.json();
};

export const clientLoader = async () => {
	try {
		const stats = await fetchBackupStatistics();
		const history = await fetchBackupHistory();
		return { stats, history };
	} catch {
		return { stats: [], history: [] };
	}
};

export default function Statistics({ loaderData }: Route.ComponentProps) {
	const { data: statsData } = useQuery({
		queryKey: ["backup-statistics"],
		queryFn: fetchBackupStatistics,
		initialData: loaderData.stats,
	});

	const { data: historyData } = useQuery({
		queryKey: ["backup-history"],
		queryFn: () => fetchBackupHistory(),
		initialData: loaderData.history,
	});

	const formatDuration = (ms: number) => {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);

		if (hours > 0) {
			return `${hours}u ${minutes % 60}m`;
		}
		if (minutes > 0) {
			return `${minutes}m ${seconds % 60}s`;
		}
		return `${seconds}s`;
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "success":
				return <Badge variant="default" className="bg-green-500">Succes</Badge>;
			case "warning":
				return <Badge variant="secondary" className="bg-yellow-500">Waarschuwing</Badge>;
			case "error":
				return <Badge variant="destructive">Fout</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	if (!statsData || statsData.length === 0) {
		return (
			<div className="container mx-auto py-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Backup Statistieken</h1>
					<p className="text-muted-foreground">
						Bekijk statistieken van je backup jobs
					</p>
				</div>
				<EmptyState
					icon={BarChart3}
					title="Geen statistieken beschikbaar"
					description="Er zijn nog geen backup statistieken om weer te geven. Voer eerst een backup uit."
				/>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Backup Statistieken</h1>
				<p className="text-muted-foreground">
					Overzicht van backup prestaties en geschiedenis
				</p>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Totaal Backups</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{statsData.reduce((sum: number, stat: any) => sum + stat.totalBackups, 0)}
						</div>
						<p className="text-xs text-muted-foreground">
							Laatste 30 dagen
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Succes Rate</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{Math.round(
								(statsData.reduce((sum: number, stat: any) => sum + stat.successfulBackups, 0) /
									statsData.reduce((sum: number, stat: any) => sum + stat.totalBackups, 0)) * 100
							)}%
						</div>
						<p className="text-xs text-muted-foreground">
							Succesvolle backups
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Gemiddelde Duur</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatDuration(
								statsData.reduce((sum: number, stat: any) => sum + stat.averageDuration, 0) / statsData.length
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							Per backup job
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Totaal Gegevens</CardTitle>
						<HardDrive className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							<BytesSize bytes={statsData.reduce((sum: number, stat: any) => sum + stat.totalBytes, 0)} />
						</div>
						<p className="text-xs text-muted-foreground">
							Overgedragen
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Detailed Statistics per Schedule */}
			<div className="grid gap-6 md:grid-cols-2">
				{statsData.map((stat: any) => (
					<Card key={stat.scheduleId}>
						<CardHeader>
							<CardTitle>{stat.scheduleName}</CardTitle>
							<CardDescription>
								{stat.totalBackups} backups • {stat.successfulBackups} succesvol
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium">Gemiddelde duur</p>
									<p className="text-lg">{formatDuration(stat.averageDuration)}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Gemiddelde grootte</p>
									<p className="text-lg"><BytesSize bytes={stat.averageBytes} /></p>
								</div>
							</div>

							{stat.lastBackup && (
								<>
									<Separator />
									<div>
										<p className="text-sm font-medium mb-2">Laatste backup</p>
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">
												{new Date(stat.lastBackup.startedAt).toLocaleString('nl-NL')}
											</span>
											{getStatusBadge(stat.lastBackup.status)}
										</div>
										<div className="mt-2 grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-muted-foreground">Duur:</span> {formatDuration(stat.lastBackup.duration)}
											</div>
											<div>
												<span className="text-muted-foreground">Gegevens:</span> <BytesSize bytes={stat.lastBackup.totalBytes} />
											</div>
										</div>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{/* Recent Backup History */}
			{historyData && historyData.length > 0 && (
				<Card className="mt-6">
					<CardHeader>
						<CardTitle>Recente Backups</CardTitle>
						<CardDescription>Laatste 10 backup uitvoeringen</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{historyData.slice(0, 10).map((backup: any) => (
								<div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className="font-medium">{backup.scheduleName}</span>
											{getStatusBadge(backup.status)}
										</div>
										<div className="text-sm text-muted-foreground">
											{new Date(backup.startedAt).toLocaleString('nl-NL')}
										</div>
									</div>
									<div className="text-right text-sm">
										<div>{formatDuration(backup.duration)}</div>
										<div className="text-muted-foreground"><BytesSize bytes={backup.totalBytes} /></div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
