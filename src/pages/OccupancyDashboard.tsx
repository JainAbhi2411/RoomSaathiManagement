import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProperties, getRoomsByProperty, getTenants } from '@/db/api';
import type { Property, Room, Tenant } from '@/types';
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
import { Building2, DoorOpen, Users, TrendingUp, Armchair, Bed, Home, UtensilsCrossed, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OccupancyDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProperty) {
      loadRoomsAndTenants();
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

  const loadRoomsAndTenants = async () => {
    if (!selectedProperty) return;
    try {
      const [roomsData, tenantsData] = await Promise.all([
        getRoomsByProperty(selectedProperty.id),
        getTenants(selectedProperty.id),
      ]);
      setRooms(roomsData);
      setTenants(tenantsData);
      
      // Auto-fix room occupancy on load
      await recalculateRoomOccupancy(roomsData, tenantsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const recalculateRoomOccupancy = async (roomsData: Room[], tenantsData: Tenant[]) => {
    try {
      // Count actual tenants per room
      const tenantCountByRoom: Record<string, number> = {};
      tenantsData.forEach(tenant => {
        if (tenant.room_id) {
          tenantCountByRoom[tenant.room_id] = (tenantCountByRoom[tenant.room_id] || 0) + 1;
        }
      });

      // Update rooms where occupied_seats doesn't match actual tenant count
      const updates = roomsData
        .filter(room => {
          const actualCount = tenantCountByRoom[room.id] || 0;
          return room.occupied_seats !== actualCount;
        })
        .map(room => {
          const actualCount = tenantCountByRoom[room.id] || 0;
          console.log(`Fixing room ${room.room_number}: occupied_seats ${room.occupied_seats} -> ${actualCount}`);
          return supabase
            .from('rooms')
            .update({
              occupied_seats: actualCount,
              is_occupied: actualCount > 0,
            })
            .eq('id', room.id);
        });

      if (updates.length > 0) {
        await Promise.all(updates);
        console.log(`Fixed occupancy for ${updates.length} rooms`);
        
        // Reload data to reflect changes
        const [updatedRooms, updatedTenants] = await Promise.all([
          getRoomsByProperty(selectedProperty!.id),
          getTenants(selectedProperty!.id),
        ]);
        setRooms(updatedRooms);
        setTenants(updatedTenants);
      }
    } catch (error) {
      console.error('Failed to recalculate room occupancy:', error);
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

  // Get tenant for a specific seat in a room
  const getTenantForSeat = (room: Room, seatIndex: number): Tenant | null => {
    const roomTenants = tenants.filter(t => t.room_id === room.id);
    // Sort by created_at to assign seats in order
    roomTenants.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return roomTenants[seatIndex] || null;
  };

  const getSeatStatus = (room: Room, seatIndex: number) => {
    const tenant = getTenantForSeat(room, seatIndex);
    return tenant ? 'occupied' : 'vacant';
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

      {/* Building Visualization - Complete PG in a Box */}
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
        <Card className="overflow-hidden border-2 shadow-2xl">
          {/* Building Header */}
          <CardHeader className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground border-b-4 border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-foreground/20 rounded-xl backdrop-blur-sm">
                  <Building2 className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">{selectedProperty?.name}</CardTitle>
                  <p className="text-primary-foreground/80 mt-1">
                    {selectedProperty?.property_type?.toUpperCase()} • {floors.length} {floors.length === 1 ? 'Floor' : 'Floors'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{occupancyRate}%</div>
                <p className="text-sm text-primary-foreground/80">Occupancy</p>
              </div>
            </div>
          </CardHeader>

          {/* Building Body - Floors Stacked Vertically */}
          <CardContent className="p-0 bg-gradient-to-b from-muted/30 to-background">
            <div className="relative">
              {/* Building Structure */}
              <div className="space-y-0">
                {floors.map((floor, floorIdx) => {
                  const floorRooms = roomsByFloor[floor];
                  const PropertyIcon = selectedProperty ? getPropertyIcon(selectedProperty.property_type) : DoorOpen;
                  const floorOccupied = floorRooms.reduce((sum, r) => sum + (r.occupied_seats || 0), 0);
                  const floorCapacity = floorRooms.reduce((sum, r) => sum + r.capacity, 0);
                  const floorOccupancyPercent = ((floorOccupied / floorCapacity) * 100).toFixed(0);
                  
                  return (
                    <div
                      key={floor}
                      className={cn(
                        'relative border-b-4 border-border/50',
                        floorIdx === 0 && 'border-t-4'
                      )}
                    >
                      {/* Floor Header Bar */}
                      <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 border-b-2 border-primary/30 backdrop-blur-sm">
                        <div className="flex items-center justify-between px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                              {floor === 0 ? 'G' : floor}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">
                                {floor === 0 ? 'Ground Floor' : `Floor ${floor}`}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {floorRooms.length} Rooms • {floorCapacity} Seats
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-base px-4 py-2">
                              {floorOccupancyPercent}% Full
                            </Badge>
                            <Badge variant="secondary" className="text-sm">
                              {floorOccupied}/{floorCapacity} Occupied
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Rooms on this Floor */}
                      <div className="p-6 bg-gradient-to-br from-background via-muted/20 to-background">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                          {floorRooms.map((room) => {
                            const occupiedSeats = room.occupied_seats || 0;
                            const availableSeats = room.capacity - occupiedSeats;
                            const occupancyPercent = ((occupiedSeats / room.capacity) * 100).toFixed(0);
                            const isFullyOccupied = occupiedSeats >= room.capacity;
                            const isVacant = occupiedSeats === 0;

                            return (
                              <div
                                key={room.id}
                                className={cn(
                                  'relative rounded-xl border-2 p-5 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]',
                                  getRoomStatusColor(room),
                                  'bg-card'
                                )}
                              >
                                {/* Room Header */}
                                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      'p-2 rounded-lg',
                                      isFullyOccupied ? 'bg-destructive' : isVacant ? 'bg-secondary' : 'bg-warning'
                                    )}>
                                      <PropertyIcon className={cn(
                                        'h-5 w-5',
                                        isFullyOccupied ? 'text-destructive-foreground' : isVacant ? 'text-secondary-foreground' : 'text-warning-foreground'
                                      )} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-lg">Room {room.room_number}</h4>
                                        {room.sharing_type && (
                                          <Badge variant="outline" className="text-xs capitalize">
                                            {room.sharing_type}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {room.capacity} {room.capacity === 1 ? 'Seat' : 'Seats'}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge 
                                    variant={isFullyOccupied ? 'destructive' : isVacant ? 'secondary' : 'default'}
                                    className="text-base px-3 py-1"
                                  >
                                    {occupancyPercent}%
                                  </Badge>
                                </div>

                                {/* Seats Grid with Tenant Names */}
                                <div className="space-y-3">
                                  <div 
                                    className={cn(
                                      'grid gap-3',
                                      room.capacity <= 2 ? 'grid-cols-2' :
                                      room.capacity <= 4 ? 'grid-cols-2' :
                                      'grid-cols-3'
                                    )}
                                  >
                                    {Array.from({ length: room.capacity }).map((_, seatIndex) => {
                                      const status = getSeatStatus(room, seatIndex);
                                      const tenant = getTenantForSeat(room, seatIndex);
                                      const seatNumber = seatIndex + 1;
                                      
                                      return (
                                        <div
                                          key={seatIndex}
                                          className={cn(
                                            'relative rounded-lg p-3 border-2 transition-all duration-300',
                                            getSeatColor(status),
                                            status === 'occupied' ? 'border-destructive shadow-md' : 'border-secondary',
                                            'hover:scale-105 cursor-pointer'
                                          )}
                                          title={tenant ? `${tenant.full_name} - ${tenant.phone}` : `Seat ${seatNumber} - Available`}
                                        >
                                          {/* Seat Icon */}
                                          <div className="flex items-center justify-center mb-2">
                                            <Armchair className="h-6 w-6" />
                                          </div>
                                          
                                          {/* Seat Number Badge */}
                                          <div className={cn(
                                            'absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                                            status === 'occupied' ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground'
                                          )}>
                                            {seatNumber}
                                          </div>

                                          {/* Tenant Name or Status */}
                                          <div className="text-center">
                                            {tenant ? (
                                              <>
                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                  <User className="h-3 w-3" />
                                                  <p className="text-xs font-bold truncate">
                                                    {tenant.full_name.split(' ')[0]}
                                                  </p>
                                                </div>
                                                <p className="text-[10px] opacity-80 truncate">
                                                  {tenant.full_name.split(' ').slice(1).join(' ')}
                                                </p>
                                              </>
                                            ) : (
                                              <p className="text-xs font-medium">Available</p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Room Footer Stats */}
                                  <div className="flex items-center justify-between text-xs pt-2 border-t">
                                    <div className="flex items-center gap-3">
                                      <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-destructive"></div>
                                        {occupiedSeats} Occupied
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                        {availableSeats} Available
                                      </span>
                                    </div>
                                    {room.price_per_seat && (
                                      <span className="font-semibold">₹{room.price_per_seat}/seat</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
