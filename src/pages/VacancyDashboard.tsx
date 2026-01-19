import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProperties, getRoomsByProperty } from '@/db/api';
import type { Property, Room } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, DoorOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyWithRoomsData extends Property {
  rooms: Room[];
}

export default function VacancyDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PropertyWithRoomsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const propertiesData = await getProperties(user!.id);
      
      const propertiesWithRooms = await Promise.all(
        propertiesData.map(async (property) => {
          const rooms = await getRoomsByProperty(property.id);
          return { ...property, rooms };
        })
      );

      setProperties(propertiesWithRooms);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Vacancy Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time room occupancy status</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-muted" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
            <p className="text-muted-foreground text-center">
              Add properties to view vacancy status
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {properties.map((property) => {
            const totalRooms = property.rooms.length;
            const occupiedRooms = property.rooms.filter((r) => r.is_occupied).length;
            const vacantRooms = totalRooms - occupiedRooms;
            const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

            return (
              <Card key={property.id}>
                <CardHeader>
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{property.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {property.city}, {property.state}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-secondary">{vacantRooms}</div>
                        <div className="text-xs text-muted-foreground">Vacant</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-destructive">{occupiedRooms}</div>
                        <div className="text-xs text-muted-foreground">Occupied</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{occupancyRate.toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Occupancy</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {property.rooms.length === 0 ? (
                    <div className="text-center py-8">
                      <DoorOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No rooms added yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 xl:grid-cols-8 gap-3">
                      {property.rooms.map((room) => (
                        <div
                          key={room.id}
                          className={cn(
                            'aspect-square rounded-lg border-2 p-3 flex flex-col items-center justify-center',
                            room.is_occupied
                              ? 'bg-destructive/10 border-destructive'
                              : 'bg-secondary/10 border-secondary'
                          )}
                        >
                          <div className="font-bold text-sm">{room.room_number}</div>
                          <Badge
                            variant={room.is_occupied ? 'destructive' : 'secondary'}
                            className="mt-2 text-xs"
                          >
                            {room.is_occupied ? 'Occupied' : 'Vacant'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}