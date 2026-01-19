import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, getPayments, getBookings } from '@/db/api';
import type { DashboardStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [occupancyData, setOccupancyData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [statsData, paymentsData, bookingsData] = await Promise.all([
        getDashboardStats(user!.id),
        getPayments(),
        getBookings(),
      ]);

      setStats(statsData);

      const monthlyRevenue: Record<string, number> = {};
      paymentsData.forEach((payment) => {
        if (payment.status === 'paid') {
          const month = new Date(payment.payment_date).toLocaleDateString('en-US', {
            month: 'short',
          });
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(payment.amount);
        }
      });

      const revenueChartData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue,
      }));
      setRevenueData(revenueChartData);

      setOccupancyData([
        { name: 'Occupied', value: statsData.occupiedRooms, color: 'hsl(var(--destructive))' },
        { name: 'Vacant', value: statsData.vacantRooms, color: 'hsl(var(--secondary))' },
      ]);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 bg-muted" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Skeleton className="h-96 bg-muted" />
          <Skeleton className="h-96 bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Analytics & Reports</h1>
        <p className="text-muted-foreground mt-1">Insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.totalProperties || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {stats?.occupancyRate.toFixed(1) || 0}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {(stats?.occupancyRate || 0) > 75 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-success mr-1" />
                  <span>Good performance</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-warning mr-1" />
                  <span>Needs improvement</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              ₹{stats?.monthlyRevenue.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats?.totalTenants || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total tenants</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No revenue data available
              </div>
            ) : (
              <ChartContainer
                config={{
                  revenue: {
                    label: 'Revenue',
                    color: 'hsl(var(--primary))',
                  },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            {occupancyData.length === 0 || stats?.totalRooms === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No occupancy data available
              </div>
            ) : (
              <ChartContainer
                config={{
                  occupied: {
                    label: 'Occupied',
                    color: 'hsl(var(--destructive))',
                  },
                  vacant: {
                    label: 'Vacant',
                    color: 'hsl(var(--secondary))',
                  },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Metrics Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Rooms</span>
                <span className="font-semibold">{stats?.totalRooms || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Occupied Rooms</span>
                <span className="font-semibold text-destructive">{stats?.occupiedRooms || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Vacant Rooms</span>
                <span className="font-semibold text-secondary">{stats?.vacantRooms || 0}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Tenants</span>
                <span className="font-semibold">{stats?.totalTenants || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Payments</span>
                <span className="font-semibold text-warning">{stats?.pendingPayments || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                <span className="font-semibold text-secondary">
                  ₹{stats?.monthlyRevenue.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}