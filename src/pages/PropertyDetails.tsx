import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPropertyById, getRoomsByProperty } from '@/db/api';
import type { PropertyWithRooms, Room } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, DoorOpen, Calendar } from 'lucide-react';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<PropertyWithRooms | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPropertyDetails();
    }
  }, [id]);

  const loadPropertyDetails = async () => {
    try {
      setLoading(true);
      const [propertyData, roomsData] = await Promise.all([
        getPropertyById(id!),
        getRoomsByProperty(id!),
      ]);
      setProperty(propertyData);
      setRooms(roomsData);
    } catch (error) {
      console.error('Failed to load property details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 bg-muted" />
        <Skeleton className="h-64 w-full bg-muted" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl xl:text-3xl font-bold text-foreground">{property.name}</h1>
          <p className="text-muted-foreground mt-1">Property Details</p>
        </div>
        <Link to={`/properties/edit/${property.id}`}>
          <Button variant="outline">
            Edit Property
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {property.images && property.images.length > 0 && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{property.property_type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Rooms</p>
                <p className="font-medium">{property.total_rooms}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {property.address}, {property.city}, {property.state} - {property.pincode}
                </p>
              </div>
              {property.description && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{property.description}</p>
                </div>
              )}
              {property.amenities && property.amenities.length > 0 && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to={`/properties/${property.id}/booking`}>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Book Room
              </Button>
            </Link>
            <Link to="/vacancy">
              <Button variant="outline" className="w-full justify-start">
                <DoorOpen className="mr-2 h-4 w-4" />
                View Vacancy
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rooms ({rooms.length})</CardTitle>
          <Button onClick={() => navigate(`/properties/${id}/rooms`)}>
            <Plus className="mr-2 h-4 w-4" />
            Manage Rooms
          </Button>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-8">
              <DoorOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No rooms added yet</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => navigate(`/properties/${id}/rooms`)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Room
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <Card key={room.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/properties/${id}/rooms`)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Room {room.room_number}</h3>
                        <p className="text-sm text-muted-foreground">Floor {room.floor || 0}</p>
                      </div>
                      <Badge variant={room.is_occupied ? 'destructive' : 'secondary'}>
                        {room.is_occupied ? 'Occupied' : 'Vacant'}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price</span>
                        <span className="font-medium">₹{room.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Capacity</span>
                        <span className="font-medium">{room.capacity} {room.capacity === 1 ? 'person' : 'people'}</span>
                      </div>
                      {room.sharing_type && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Type</span>
                          <Badge variant="outline" className="capitalize">{room.sharing_type}</Badge>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">Click to manage rooms</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}