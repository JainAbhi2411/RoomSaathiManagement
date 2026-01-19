import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getDashboardStats, getProperties } from '@/db/api';
import type { DashboardStats, Property } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-secondary p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium opacity-90">Welcome back</span>
          </div>
          <h1 className="text-3xl xl:text-4xl font-bold mb-2">
            Hello, {(profile?.username || 'User') as string}! 👋
          </h1>
          <p className="text-white/80 mb-6">
            Here's what's happening with your properties today
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/properties/new">
              <Button variant="secondary" className="shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 hover:text-white">
                View Analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
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
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="flex items-center text-xs">
                    {stat.trendUp ? (
                      <TrendingUp className="h-3 w-3 text-success mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive mr-1" />
                    )}
                    <span className={stat.trendUp ? 'text-success' : 'text-destructive'}>
                      {stat.trend}
                    </span>
                    <span className="text-muted-foreground ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="shadow-lg border-2 hover:border-primary/30 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Room Status</span>
              <Link to="/occupancy">
                <Button variant="ghost" size="sm">
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive"></div>
                  <span className="text-sm">Occupied</span>
                </div>
                <span className="font-bold">{stats?.occupiedRooms || 0}</span>
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
