import { useMetrics } from '@/lib/api/hooks';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp, Clock, Timer } from 'lucide-react';

export default function DashPage() {
  const { data: metrics, isLoading } = useMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading metrics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No metrics available</p>
      </div>
    );
  }

  const chartConfig = {
    utilization: {
      label: 'Utilization',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboards</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Period: {metrics.date_range.from} to {metrics.date_range.to}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jobs Completed</p>
              <p className="text-3xl font-bold mt-2">{metrics.jobs_completed}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-success" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jobs Deferred</p>
              <p className="text-3xl font-bold mt-2">{metrics.jobs_deferred}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-warning" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">On-Time %</p>
              <p className="text-3xl font-bold mt-2">{metrics.on_time_percentage}%</p>
            </div>
            <Clock className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Service Time</p>
              <p className="text-3xl font-bold mt-2">{metrics.avg_service_time_minutes}m</p>
            </div>
            <Timer className="w-8 h-8 text-accent" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization by Truck */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Utilization by Truck</h3>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.utilization_by_truck}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="truck_name" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="utilization" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* Jobs Trend (mocked data) */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Jobs Completed vs Deferred</h3>
          <ChartContainer
            config={{
              completed: { label: 'Completed', color: 'hsl(var(--success))' },
              deferred: { label: 'Deferred', color: 'hsl(var(--warning))' },
            }}
            className="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { day: 'Mon', completed: 28, deferred: 3 },
                  { day: 'Tue', completed: 31, deferred: 2 },
                  { day: 'Wed', completed: 25, deferred: 4 },
                  { day: 'Thu', completed: 29, deferred: 3 },
                  { day: 'Fri', completed: 29, deferred: 6 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--success))' }}
                />
                <Line
                  type="monotone"
                  dataKey="deferred"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--warning))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      </div>

      {/* Heatmap placeholder */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Location Heatmap</h3>
        <div className="h-96 flex items-center justify-center bg-muted/20 rounded-md">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-sm text-muted-foreground">
              Heatmap overlay will appear here with Google Maps
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Feature flag: heatmap = {String(metrics.heatmap_data !== undefined)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
