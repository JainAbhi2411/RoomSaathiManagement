import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyById, getRoomsByProperty, getTenants, createBooking, createTenant, updateRoom } from '@/db/api';
import type { PropertyWithRooms, Room, Tenant } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RoomBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<PropertyWithRooms | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    tenant_id: '',
    check_in_date: '',
    total_amount: 0,
  });
  const [newTenant, setNewTenant] = useState({
    full_name: '',
    phone: '',
    email: '',
  });
  const [showNewTenantForm, setShowNewTenantForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [propertyData, roomsData, tenantsData] = await Promise.all([
        getPropertyById(id!),
        getRoomsByProperty(id!),
        getTenants(id!),
      ]);
      setProperty(propertyData);
      setRooms(roomsData);
      setTenants(tenantsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = (room: Room) => {
    if (room.is_occupied) return;
    setSelectedRoom(room);
    setBookingForm({
      tenant_id: '',
      check_in_date: new Date().toISOString().split('T')[0],
      total_amount: room.price,
    });
    setDialogOpen(true);
  };

  const handleCreateTenant = async () => {
    try {
      const tenant = await createTenant({
        property_id: id!,
        full_name: newTenant.full_name,
        phone: newTenant.phone,
        email: newTenant.email || null,
      });
      
      if (tenant) {
        setTenants([...tenants, tenant]);
        setBookingForm({ ...bookingForm, tenant_id: tenant.id });
        setShowNewTenantForm(false);
        setNewTenant({ full_name: '', phone: '', email: '' });
        toast({
          title: 'Success',
          description: 'Tenant created successfully',
        });
      }
    } catch (error) {
      console.error('Failed to create tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to create tenant',
        variant: 'destructive',
      });
    }
  };

  const handleBookRoom = async () => {
    if (!selectedRoom || !bookingForm.tenant_id) return;

    try {
      await createBooking({
        property_id: id!,
        room_id: selectedRoom.id,
        tenant_id: bookingForm.tenant_id,
        check_in_date: bookingForm.check_in_date,
        status: 'confirmed',
        total_amount: bookingForm.total_amount,
      });

      await updateRoom(selectedRoom.id, { is_occupied: true });

      toast({
        title: 'Success',
        description: 'Room booked successfully',
      });

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to book room:', error);
      toast({
        title: 'Error',
        description: 'Failed to book room',
        variant: 'destructive',
      });
    }
  };

  if (loading || !property) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Book a Room</h1>
          <p className="text-muted-foreground mt-1">{property.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select a Room</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on an available room to book it
          </p>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No rooms available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleRoomClick(room)}
                  disabled={room.is_occupied}
                  className={cn(
                    'aspect-square rounded-lg border-2 p-4 flex flex-col items-center justify-center transition-all',
                    room.is_occupied
                      ? 'bg-destructive/10 border-destructive cursor-not-allowed'
                      : 'bg-secondary/10 border-secondary hover:border-primary hover:bg-primary/10 cursor-pointer',
                    selectedRoom?.id === room.id && 'border-primary bg-primary/20'
                  )}
                >
                  <div className="text-lg font-bold">{room.room_number}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {room.is_occupied ? 'Occupied' : `₹${room.price}`}
                  </div>
                  {room.is_occupied && (
                    <Check className="h-4 w-4 text-destructive mt-2" />
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Room {selectedRoom?.room_number}</DialogTitle>
            <DialogDescription>Enter booking details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!showNewTenantForm ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tenant">Select Tenant *</Label>
                  <Select
                    value={bookingForm.tenant_id}
                    onValueChange={(value) => setBookingForm({ ...bookingForm, tenant_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.full_name} - {tenant.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => setShowNewTenantForm(true)}
                  >
                    + Add New Tenant
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={newTenant.full_name}
                    onChange={(e) => setNewTenant({ ...newTenant, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={newTenant.phone}
                    onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTenant.email}
                    onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTenant}>Create Tenant</Button>
                  <Button variant="outline" onClick={() => setShowNewTenantForm(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            )}

            {!showNewTenantForm && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="check_in_date">Check-in Date *</Label>
                  <Input
                    id="check_in_date"
                    type="date"
                    value={bookingForm.check_in_date}
                    onChange={(e) => setBookingForm({ ...bookingForm, check_in_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Amount *</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    min="0"
                    value={bookingForm.total_amount}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, total_amount: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
              </>
            )}
          </div>
          {!showNewTenantForm && (
            <DialogFooter>
              <Button onClick={handleBookRoom} disabled={!bookingForm.tenant_id}>
                Confirm Booking
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}