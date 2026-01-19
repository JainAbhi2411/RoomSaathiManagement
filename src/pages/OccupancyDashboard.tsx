import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProperties, getRoomsByProperty } from '@/db/api';
import type { Property, Room } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, DoorOpen, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OccupancyDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProperty) {
      loadRooms();
    }
  }, [selectedProperty]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const propertiesData = await getProperties(user!.id);
      setProperties(propertiesData);
      if (propertiesData.length > 0) {
        setSelectedProperty(propertiesData[0]);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    if (!selectedProperty) return;
    try {
      const roomsData = await getRoomsByProperty(selectedProperty.id);
      setRooms(roomsData);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  };

  // Group rooms by floor
  const roomsByFloor = rooms.reduce((acc, room) => {
    const floor = room.floor || 0;
    if (!acc[floor]) {
      acc[floor] = [];
    }
    acc[floor].push(room);
    return acc;
  }, {} as Record<number, Room[]>);

  const floors = Object.keys(roomsByFloor)
    .map(Number)
    .sort((a, b) => b - a); // Sort floors in descending order

  // Calculate statistics
  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const totalOccupied = rooms.reduce((sum, room) => sum + (room.occupied_seats || 0), 0);
  const occupancyRate = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : '0';
  const fullyOccupiedRooms = rooms.filter(room => 
    (room.occupied_seats || 0) >= room.capacity
  ).length;
  const vacantRooms = rooms.filter(room => 
    (room.occupied_seats || 0) === 0
  ).length;

  const getSeatStatus = (room: Room, seatIndex: number) => {
    const occupiedSeats = room.occupied_seats || 0;
    return seatIndex < occupiedSeats ? 'occupied' : 'vacant';
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-destructive hover:bg-destructive/90';
      case 'vacant':
        return 'bg-secondary hover:bg-secondary/80';
      default:
        return 'bg-muted';
    }
  };

  const getRoomStatusColor = (room: Room) => {
    const occupiedSeats = room.occupied_seats || 0;
    const capacity = room.capacity;
    const occupancyPercent = (occupiedSeats / capacity) * 100;

    if (occupancyPercent === 0) return 'border-secondary';
    if (occupancyPercent === 100) return 'border-destructive';
    return 'border-warning';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 bg-muted" />
        <Skeleton className="h-96 w-full bg-muted" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Properties Found</h2>
        <p className="text-muted-foreground mb-6">Add a property to view occupancy dashboard</p>
        <Button onClick={() => window.location.href = '/properties/new'}>
          Add Property
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Occupancy Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time room and seat occupancy visualization</p>
        </div>
        <div className="w-full xl:w-64">
          <Select
            value={selectedProperty?.id}
            onValueChange={(value) => {
              const property = properties.find(p => p.id === value);
              setSelectedProperty(property || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              {selectedProperty?.number_of_floors || 0} floors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
            <p className="text-xs text-muted-foreground">
              {totalOccupied} occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {fullyOccupiedRooms} fully occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacant Rooms</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vacantRooms}</div>
            <p className="text-xs text-muted-foreground">
              Available now
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-secondary border-2" />
              <span className="text-sm">Vacant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-destructive border-2" />
              <span className="text-sm">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded border-2 border-warning bg-warning/20" />
              <span className="text-sm">Partially Occupied</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floor-wise Room Visualization */}
      {rooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DoorOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No rooms added yet for this property
            </p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => window.location.href = `/properties/${selectedProperty?.id}/rooms`}
            >
              Add Rooms
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {floors.map((floor) => (
            <Card key={floor}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {floor === 0 ? 'Ground Floor' : `Floor ${floor}`}
                  </CardTitle>
                  <Badge variant="outline">
                    {roomsByFloor[floor].length} {roomsByFloor[floor].length === 1 ? 'Room' : 'Rooms'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {roomsByFloor[floor].map((room) => {
                    const occupiedSeats = room.occupied_seats || 0;
                    const availableSeats = room.capacity - occupiedSeats;
                    const occupancyPercent = ((occupiedSeats / room.capacity) * 100).toFixed(0);

                    return (
                      <Card 
                        key={room.id} 
                        className={cn(
                          'border-2 transition-all hover:shadow-lg',
                          getRoomStatusColor(room)
                        )}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">Room {room.room_number}</CardTitle>
                              {room.sharing_type && (
                                <Badge variant="secondary" className="mt-1 capitalize">
                                  {room.sharing_type}
                                </Badge>
                              )}
                            </div>
                            <Badge 
                              variant={occupiedSeats === room.capacity ? 'destructive' : occupiedSeats > 0 ? 'default' : 'secondary'}
                            >
                              {occupancyPercent}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Capacity:</span>
                              <span className="font-medium">{room.capacity} {room.capacity === 1 ? 'person' : 'people'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Occupied:</span>
                              <span className="font-medium">{occupiedSeats}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Available:</span>
                              <span className="font-medium text-secondary">{availableSeats}</span>
                            </div>

                            {/* Seat Visualization */}
                            <div className="pt-3 border-t">
                              <p className="text-xs text-muted-foreground mb-2">Seats:</p>
                              <div className="grid grid-cols-5 gap-2">
                                {Array.from({ length: room.capacity }).map((_, index) => {
                                  const status = getSeatStatus(room, index);
                                  return (
                                    <div
                                      key={index}
                                      className={cn(
                                        'aspect-square rounded flex items-center justify-center text-xs font-medium transition-colors cursor-pointer',
                                        getSeatColor(status),
                                        status === 'occupied' ? 'text-destructive-foreground' : 'text-secondary-foreground'
                                      )}
                                      title={`Seat ${index + 1} - ${status}`}
                                    >
                                      {index + 1}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {room.price && (
                              <div className="pt-3 border-t">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Price:</span>
                                  <span className="font-semibold">
                                    ₹{room.price_per_seat ? `${room.price_per_seat}/seat` : room.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
