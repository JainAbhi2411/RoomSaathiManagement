import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTenants, createTenant, updateTenant, deleteTenant, getProperties, getRoomsByProperty, updateRoom } from '@/db/api';
import type { Tenant, Property, Room } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

export default function Tenants() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [tenantForm, setTenantForm] = useState({
    property_id: '',
    room_id: '',
    full_name: '',
    email: '',
    phone: '',
    id_proof_type: '',
    id_proof_number: '',
    emergency_contact: '',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantsData, propertiesData] = await Promise.all([
        getTenants(),
        getProperties(user!.id),
      ]);
      setTenants(tenantsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = async (tenant?: Tenant) => {
    if (tenant) {
      setEditingTenant(tenant);
      setTenantForm({
        property_id: tenant.property_id,
        room_id: tenant.room_id || '',
        full_name: tenant.full_name,
        email: tenant.email || '',
        phone: tenant.phone,
        id_proof_type: tenant.id_proof_type || '',
        id_proof_number: tenant.id_proof_number || '',
        emergency_contact: tenant.emergency_contact || '',
      });
      // Load rooms for the property
      if (tenant.property_id) {
        const roomsData = await getRoomsByProperty(tenant.property_id);
        setRooms(roomsData);
      }
    } else {
      setEditingTenant(null);
      setTenantForm({
        property_id: '',
        room_id: '',
        full_name: '',
        email: '',
        phone: '',
        id_proof_type: '',
        id_proof_number: '',
        emergency_contact: '',
      });
      setRooms([]);
    }
    setDialogOpen(true);
  };

  const handlePropertyChange = async (propertyId: string) => {
    setTenantForm({ ...tenantForm, property_id: propertyId, room_id: '' });
    if (propertyId) {
      const roomsData = await getRoomsByProperty(propertyId);
      setRooms(roomsData);
    } else {
      setRooms([]);
    }
  };

  const handleSaveTenant = async () => {
    try {
      const tenantData = {
        property_id: tenantForm.property_id,
        room_id: tenantForm.room_id || null,
        full_name: tenantForm.full_name,
        email: tenantForm.email || null,
        phone: tenantForm.phone,
        id_proof_type: tenantForm.id_proof_type || null,
        id_proof_number: tenantForm.id_proof_number || null,
        emergency_contact: tenantForm.emergency_contact || null,
      };

      // Get the old room_id if editing
      const oldRoomId = editingTenant?.room_id;
      const newRoomId = tenantForm.room_id;

      if (editingTenant) {
        await updateTenant(editingTenant.id, tenantData);
        
        // Update room occupancy if room changed
        if (oldRoomId !== newRoomId) {
          // Decrease occupancy of old room
          if (oldRoomId) {
            const oldRoom = rooms.find(r => r.id === oldRoomId);
            if (oldRoom) {
              await updateRoom(oldRoomId, {
                occupied_seats: Math.max(0, (oldRoom.occupied_seats || 0) - 1),
                is_occupied: (oldRoom.occupied_seats || 0) - 1 > 0,
              });
            }
          }
          
          // Increase occupancy of new room
          if (newRoomId) {
            const newRoom = rooms.find(r => r.id === newRoomId);
            if (newRoom) {
              await updateRoom(newRoomId, {
                occupied_seats: (newRoom.occupied_seats || 0) + 1,
                is_occupied: true,
              });
            }
          }
        }
        
        toast({
          title: 'Success',
          description: 'Tenant updated successfully',
        });
      } else {
        await createTenant(tenantData);
        
        // Update room occupancy for new tenant
        if (newRoomId) {
          const room = rooms.find(r => r.id === newRoomId);
          if (room) {
            await updateRoom(newRoomId, {
              occupied_seats: (room.occupied_seats || 0) + 1,
              is_occupied: true,
            });
          }
        }
        
        toast({
          title: 'Success',
          description: 'Tenant created successfully',
        });
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to save tenant',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTenant = async (id: string) => {
    try {
      await deleteTenant(id);
      toast({
        title: 'Success',
        description: 'Tenant deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tenant',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Tenants</h1>
          <p className="text-muted-foreground mt-1">Manage your tenants</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTenant ? 'Edit Tenant' : 'Add Tenant'}</DialogTitle>
              <DialogDescription>
                {editingTenant ? 'Update tenant information' : 'Create a new tenant'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="property_id">Property *</Label>
                <Select
                  value={tenantForm.property_id}
                  onValueChange={handlePropertyChange}
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
              <div className="col-span-2 space-y-2">
                <Label htmlFor="room_id">Room (Optional)</Label>
                <Select
                  value={tenantForm.room_id}
                  onValueChange={(value) => setTenantForm({ ...tenantForm, room_id: value })}
                  disabled={!tenantForm.property_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tenantForm.property_id ? "Select a room" : "Select property first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.filter(room => {
                      // Show only rooms that are not fully occupied
                      const property = properties.find(p => p.id === tenantForm.property_id);
                      const isPgOrHostel = property?.property_type === 'pg' || property?.property_type === 'hostel';
                      if (isPgOrHostel) {
                        return (room.occupied_seats || 0) < room.capacity;
                      }
                      return !room.is_occupied;
                    }).map((room) => {
                      const availableSeats = room.capacity - (room.occupied_seats || 0);
                      return (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.room_number} - Floor {room.floor || 0} 
                          {room.sharing_type && ` (${room.sharing_type})`}
                          {availableSeats > 0 && ` - ${availableSeats} seat${availableSeats > 1 ? 's' : ''} available`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {rooms.length === 0 && tenantForm.property_id && 'No rooms available for this property'}
                  {!tenantForm.property_id && 'Select a property to see available rooms'}
                </p>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={tenantForm.full_name}
                  onChange={(e) => setTenantForm({ ...tenantForm, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={tenantForm.phone}
                  onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={tenantForm.email}
                  onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_proof_type">ID Proof Type</Label>
                <Input
                  id="id_proof_type"
                  value={tenantForm.id_proof_type}
                  onChange={(e) => setTenantForm({ ...tenantForm, id_proof_type: e.target.value })}
                  placeholder="Aadhar, PAN, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_proof_number">ID Proof Number</Label>
                <Input
                  id="id_proof_number"
                  value={tenantForm.id_proof_number}
                  onChange={(e) => setTenantForm({ ...tenantForm, id_proof_number: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={tenantForm.emergency_contact}
                  onChange={(e) => setTenantForm({ ...tenantForm, emergency_contact: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveTenant}>
                {editingTenant ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tenants ({tenants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tenants Yet</h3>
              <p className="text-muted-foreground">Add your first tenant to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>ID Proof</TableHead>
                    <TableHead>Emergency Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.full_name}</TableCell>
                      <TableCell>{tenant.phone}</TableCell>
                      <TableCell>{tenant.email || '-'}</TableCell>
                      <TableCell>
                        {tenant.id_proof_type && tenant.id_proof_number
                          ? `${tenant.id_proof_type}: ${tenant.id_proof_number}`
                          : '-'}
                      </TableCell>
                      <TableCell>{tenant.emergency_contact || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenDialog(tenant)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this tenant? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTenant(tenant.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}