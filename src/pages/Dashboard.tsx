import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardStats, getProperties } from '@/db/api';
import type { DashboardStats, Property } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import {
  Building2,
  DoorOpen,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Sparkles,
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  IndianRupee,
  Calendar,
  Activity,
  BarChart3,
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { limits, hasFeature } = usePlanLimits();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, propertiesData] = await Promise.all([
        getDashboardStats(user!.id),
        getProperties(user!.id),
      ]);
      setStats(statsData);
      setProperties(propertiesData.slice(0, 3));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Properties',
      value: stats?.totalProperties || 0,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Rooms',
      value: stats?.totalRooms || 0,
      icon: DoorOpen,
      color: 'text-info',
      bgColor: 'bg-info/10',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Occupancy Rate',
      value: `${stats?.occupancyRate.toFixed(1) || 0}%`,
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats?.monthlyRevenue.toLocaleString() || 0}`,
      icon: CreditCard,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      trend: '+15%',
      trendUp: true,
    },
  ];

  return (
    <div className="@container space-y-6 xl:space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-secondary p-6 xl:p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 xl:h-5 xl:w-5" />
              <span className="text-xs xl:text-sm font-medium opacity-90">Welcome back</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {limits.planName}
            </Badge>
          </div>
          <h1 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold mb-2">
            Hello, {(profile?.username || 'User') as string}! 👋
          </h1>
          <p className="text-sm xl:text-base text-white/80 mb-4 xl:mb-6">
            Here's what's happening with your properties today
          </p>
          <div className="flex flex-wrap gap-2 xl:gap-3">
            <Link to="/properties/new" className="flex-1 @sm:flex-none">
              <Button variant="secondary" className="shadow-lg w-full @sm:w-auto" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden @sm:inline">Add Property</span>
                <span className="@sm:hidden">Add</span>
              </Button>
            </Link>
            {hasFeature('Advanced Analytics') && (
              <Link to="/analytics" className="flex-1 @sm:flex-none">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 hover:bg-white/20 hover:text-white w-full @sm:w-auto">
                  <span className="hidden @sm:inline">View Analytics</span>
                  <span className="@sm:hidden">Analytics</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 xl:w-64 xl:h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 xl:w-48 xl:h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 @sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24 bg-muted" />
                <Skeleton className="h-8 w-8 rounded-lg bg-muted" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2 bg-muted" />
                <Skeleton className="h-3 w-16 bg-muted" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 xl:h-5 xl:w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl xl:text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="flex items-center text-xs">
                    {stat.trendUp ? (
                      <TrendingUp className="h-3 w-3 text-success mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive mr-1" />
                    )}
                    <span className={stat.trendUp ? 'text-success' : 'text-destructive'}>
                      {stat.trend}
                    </span>
                    <span className="text-muted-foreground ml-1 hidden @sm:inline">from last month</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Quick Actions & Notifications */}
      <div className="grid grid-cols-1 @sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
        <Card className="shadow-lg border-2 hover:border-primary/30 transition-all @sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base xl:text-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Recent Notifications</span>
              </div>
              <Badge variant="secondary" className="text-xs">3 New</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Rent Payment Due</p>
                  <p className="text-xs text-muted-foreground">3 tenants have pending payments for this month</p>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Payment Received</p>
                  <p className="text-xs text-muted-foreground">₹15,000 received from Room 101</p>
                  <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Maintenance Scheduled</p>
                  <p className="text-xs text-muted-foreground">AC repair scheduled for tomorrow at 10 AM</p>
                  <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                </div>
              </div>
            </div>
            <Link to="/notifications" className="block mt-4">
              <Button variant="outline" size="sm" className="w-full">
                View All Notifications
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2 hover:border-primary/30 transition-all @sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base xl:text-lg">
              <Activity className="h-5 w-5 text-primary" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/properties/new" className="block">
                <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                  <Building2 className="h-6 w-6 text-primary" />
                  <span className="text-xs font-medium">Add Property</span>
                </Button>
              </Link>
              <Link to="/tenants" className="block">
                <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-xs font-medium">Manage Tenants</span>
                </Button>
              </Link>
              <Link to="/rent-payments" className="block">
                <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <span className="text-xs font-medium">Collect Rent</span>
                </Button>
              </Link>
              <Link to="/analytics" className="block">
                <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <span className="text-xs font-medium">View Reports</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <div className="flex flex-col @sm:flex-row @sm:items-center @sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg xl:text-xl">
                <IndianRupee className="h-5 w-5 xl:h-6 xl:w-6 text-primary" />
                <span>Financial Overview</span>
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Track your revenue and expenses
              </CardDescription>
            </div>
            <Link to="/analytics">
              <Button variant="outline" size="sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                Detailed Reports
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 @sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-500">₹{stats?.monthlyRevenue.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Collected</p>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-500">₹{((stats?.monthlyRevenue || 0) * 0.85).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">85% collected</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <Clock className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-yellow-500">₹{((stats?.monthlyRevenue || 0) * 0.15).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">15% pending</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Avg. Rent</p>
                <IndianRupee className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-500">₹{Math.round((stats?.monthlyRevenue || 0) / (stats?.occupiedRooms || 1)).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Per room</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Collection Rate</p>
              <p className="text-sm font-bold text-green-500">85%</p>
            </div>
            <Progress value={85} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Excellent! You're collecting rent on time from most tenants.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 @sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
        <Card className="shadow-lg border-2 hover:border-primary/30 transition-all">
          <CardHeader>
            <CardTitle className="flex flex-col @sm:flex-row @sm:items-center @sm:justify-between gap-2">
              <span className="text-base xl:text-lg">Room Status</span>
              <Link to="/occupancy">
                <Button variant="ghost" size="sm" className="w-full @sm:w-auto">
                  <span className="hidden @sm:inline">View Details</span>
                  <span className="@sm:hidden">Details</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 xl:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive"></div>
                  <span className="text-sm">Occupied</span>
                </div>
                <span className="font-bold text-base xl:text-lg">{stats?.occupiedRooms || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-secondary"></div>
                  <span className="text-sm">Vacant</span>
                </div>
                <span className="font-bold">{stats?.vacantRooms || 0}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-destructive to-secondary h-full transition-all duration-500"
                  style={{
                    width: `${stats?.occupancyRate || 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Payments</span>
              <Badge variant="secondary" className="bg-warning text-warning-foreground">
                {stats?.pendingPayments || 0} Pending
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">This Month</div>
                <div className="text-2xl font-bold text-secondary">
                  ₹{stats?.monthlyRevenue.toLocaleString() || 0}
                </div>
              </div>
              <Link to="/rent-payments">
                <Button variant="outline" className="w-full">
                  View All Payments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tenants</span>
              <Badge variant="default">{stats?.totalTenants || 0} Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Tenants</div>
                <div className="text-2xl font-bold text-primary">{stats?.totalTenants || 0}</div>
              </div>
              <Link to="/tenants">
                <Button variant="outline" className="w-full">
                  Manage Tenants
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Properties */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Properties</CardTitle>
            <Link to="/properties">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full bg-muted" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first property</p>
              <Link to="/properties/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <Link
                  key={property.id}
                  to={`/properties/${property.id}`}
                  className="flex items-center gap-4 p-4 rounded-lg border-2 hover:border-primary/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{property.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {property.city}, {property.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="capitalize">
                      {property.property_type.replace('_', ' ')}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {property.total_rooms} rooms
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
