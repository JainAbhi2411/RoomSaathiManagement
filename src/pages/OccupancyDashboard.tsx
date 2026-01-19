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
import { Building2, DoorOpen, Users, TrendingUp, Armchair, Bed, Home, UtensilsCrossed } from 'lucide-react';
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
        return 'bg-destructive text-destructive-foreground';
      case 'vacant':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoomStatusColor = (room: Room) => {
    const occupiedSeats = room.occupied_seats || 0;
    const capacity = room.capacity;
    const occupancyPercent = (occupiedSeats / capacity) * 100;

    if (occupancyPercent === 0) return 'border-secondary bg-secondary/5';
    if (occupancyPercent === 100) return 'border-destructive bg-destructive/5';
    return 'border-warning bg-warning/5';
  };

  const getPropertyIcon = (propertyType: string) => {
    switch (propertyType) {
      case 'pg':
      case 'hostel':
        return Bed;
      case 'flat':
        return Home;
      case 'mess':
        return UtensilsCrossed;
      default:
        return DoorOpen;
    }
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

      {/* Floor-wise Room Visualization - Movie Theater Style */}
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
        <div className="space-y-8">
          {floors.map((floor) => {
            const floorRooms = roomsByFloor[floor];
            const PropertyIcon = selectedProperty ? getPropertyIcon(selectedProperty.property_type) : DoorOpen;
            
            return (
              <Card key={floor} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary rounded-lg">
                        <Building2 className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          {floor === 0 ? 'Ground Floor' : `Floor ${floor}`}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {floorRooms.length} {floorRooms.length === 1 ? 'Room' : 'Rooms'} • 
                          {' '}{floorRooms.reduce((sum, r) => sum + r.capacity, 0)} Total Seats
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {floorRooms.filter(r => (r.occupied_seats || 0) > 0).length}/{floorRooms.length} Occupied
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {/* Movie Theater Style Layout */}
                  <div className="space-y-6">
                    {floorRooms.map((room, roomIndex) => {
                      const occupiedSeats = room.occupied_seats || 0;
                      const availableSeats = room.capacity - occupiedSeats;
                      const occupancyPercent = ((occupiedSeats / room.capacity) * 100).toFixed(0);
                      const isFullyOccupied = occupiedSeats >= room.capacity;
                      const isVacant = occupiedSeats === 0;

                      return (
                        <div
                          key={room.id}
                          className={cn(
                            'relative p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-xl',
                            getRoomStatusColor(room),
                            'hover:scale-[1.02]'
                          )}
                        >
                          {/* Room Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                'p-3 rounded-lg',
                                isFullyOccupied ? 'bg-destructive' : isVacant ? 'bg-secondary' : 'bg-warning'
                              )}>
                                <PropertyIcon className={cn(
                                  'h-6 w-6',
                                  isFullyOccupied ? 'text-destructive-foreground' : isVacant ? 'text-secondary-foreground' : 'text-warning-foreground'
                                )} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xl font-bold">Room {room.room_number}</h3>
                                  {room.sharing_type && (
                                    <Badge variant="secondary" className="capitalize">
                                      {room.sharing_type}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {room.capacity} {room.capacity === 1 ? 'Seat' : 'Seats'} • 
                                  {' '}{occupiedSeats} Occupied • 
                                  {' '}{availableSeats} Available
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant={isFullyOccupied ? 'destructive' : isVacant ? 'secondary' : 'default'}
                                className="text-lg px-4 py-2"
                              >
                                {occupancyPercent}%
                              </Badge>
                              {room.price && (
                                <p className="text-sm font-semibold mt-2">
                                  ₹{room.price_per_seat ? `${room.price_per_seat}/seat` : room.price.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Movie Theater Style Seat Grid */}
                          <div className="bg-background/50 rounded-lg p-6 border">
                            <div className="flex items-center justify-center mb-4">
                              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-1 bg-muted rounded-full">
                                Room Layout
                              </div>
                            </div>
                            
                            {/* Seat Grid - Theater Style */}
                            <div className="flex justify-center">
                              <div 
                                className={cn(
                                  'grid gap-3',
                                  room.capacity <= 2 ? 'grid-cols-2' :
                                  room.capacity <= 4 ? 'grid-cols-2' :
                                  room.capacity <= 6 ? 'grid-cols-3' :
                                  room.capacity <= 9 ? 'grid-cols-3' :
                                  'grid-cols-4'
                                )}
                                style={{ maxWidth: '400px' }}
                              >
                                {Array.from({ length: room.capacity }).map((_, seatIndex) => {
                                  const status = getSeatStatus(room, seatIndex);
                                  const seatNumber = seatIndex + 1;
                                  
                                  return (
                                    <div
                                      key={seatIndex}
                                      className="flex flex-col items-center gap-2 group"
                                      title={`Seat ${seatNumber} - ${status === 'occupied' ? 'Occupied' : 'Available'}`}
                                    >
                                      {/* Seat Icon */}
                                      <div
                                        className={cn(
                                          'relative w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer',
                                          getSeatColor(status),
                                          'hover:scale-110 hover:shadow-lg',
                                          'border-2',
                                          status === 'occupied' ? 'border-destructive' : 'border-secondary'
                                        )}
                                      >
                                        <Armchair className="h-8 w-8" />
                                        {/* Seat Number Badge */}
                                        <div className={cn(
                                          'absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                                          status === 'occupied' ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground'
                                        )}>
                                          {seatNumber}
                                        </div>
                                      </div>
                                      {/* Seat Label */}
                                      <span className={cn(
                                        'text-xs font-medium',
                                        status === 'occupied' ? 'text-destructive' : 'text-secondary'
                                      )}>
                                        {status === 'occupied' ? 'Occupied' : 'Available'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Room Stats Bar */}
                            <div className="mt-6 pt-4 border-t">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                                    <span className="text-muted-foreground">{occupiedSeats} Occupied</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                                    <span className="text-muted-foreground">{availableSeats} Available</span>
                                  </div>
                                </div>
                                <div className="font-semibold">
                                  Capacity: {room.capacity}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
