import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPropertyById } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { Property, Room } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, Upload, X, Loader2, DoorOpen, Users, IndianRupee } from 'lucide-react';
import { SHARING_TYPES, FURNISHING_STATUS, ROOM_AMENITIES } from '@/data/indiaData';
import { Badge } from '@/components/ui/badge';

export default function RoomManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [uploading, setUploading] = useState(false);

  // Room form state
  const [roomForm, setRoomForm] = useState({
    room_number: '',
    floor: 0,
    sharing_type: '',
    capacity: 1,
    price: 0,
    price_per_seat: 0,
    room_size: 0,
    room_description: '',
    furnishing_status: '',
    has_attached_bathroom: false,
    has_balcony: false,
    room_amenities: [] as string[],
    room_images: [] as string[],
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  // Calculate available floors based on property configuration
  const getAvailableFloors = () => {
    if (!property) return [];

    const numberOfFloors = property.number_of_floors || 0;
    const roomsPerFloor = property.rooms_per_floor || 0;

    if (numberOfFloors === 0 || roomsPerFloor === 0) {
      return [];
    }

    // Count rooms per floor
    const roomCountByFloor: Record<number, number> = {};
    rooms.forEach((room) => {
      const floor = room.floor || 0;
      roomCountByFloor[floor] = (roomCountByFloor[floor] || 0) + 1;
    });

    // Generate available floors (0 to numberOfFloors-1)
    const availableFloors: Array<{ floor: number; available: number; total: number }> = [];
    for (let i = 0; i < numberOfFloors; i++) {
      const currentCount = roomCountByFloor[i] || 0;
      const available = roomsPerFloor - currentCount;
      
      // Only include floors that have space available
      if (available > 0 || (editingRoom && editingRoom.floor === i)) {
        availableFloors.push({
          floor: i,
          available,
          total: roomsPerFloor,
        });
      }
    }

    return availableFloors;
  };

  const availableFloors = getAvailableFloors();
  const totalRoomsAllowed = (property?.number_of_floors || 0) * (property?.rooms_per_floor || 0);
  const canAddMoreRooms = rooms.length < totalRoomsAllowed;

  const loadData = async () => {
    try {
      setLoading(true);
      const propertyData = await getPropertyById(id!);
      setProperty(propertyData);

      // Load rooms
      const { data: roomsData, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('property_id', id!)
        .order('room_number');

      if (error) throw error;
      setRooms(roomsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > 1920 || height > 1080) {
            if (width > height) {
              height = (height / width) * 1920;
              width = 1920;
            } else {
              width = (width / height) * 1080;
              height = 1080;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/webp',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/webp',
            0.8
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      let file = files[0];

      if (file.size > 1048576) {
        file = await compressImage(file);
      }

      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('app-91hx0yyrhd6p_property_images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('app-91hx0yyrhd6p_property_images')
        .getPublicUrl(data.path);

      setRoomForm({
        ...roomForm,
        room_images: [...roomForm.room_images, urlData.publicUrl],
      });

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setRoomForm({
      ...roomForm,
      room_images: roomForm.room_images.filter((_, i) => i !== index),
    });
  };

  const handleAmenityToggle = (amenityId: string) => {
    setRoomForm((prev) => ({
      ...prev,
      room_amenities: prev.room_amenities.includes(amenityId)
        ? prev.room_amenities.filter((id) => id !== amenityId)
        : [...prev.room_amenities, amenityId],
    }));
  };

  const resetForm = () => {
    setRoomForm({
      room_number: '',
      floor: 0,
      sharing_type: '',
      capacity: 1,
      price: 0,
      price_per_seat: 0,
      room_size: 0,
      room_description: '',
      furnishing_status: '',
      has_attached_bathroom: false,
      has_balcony: false,
      room_amenities: [],
      room_images: [],
    });
    setEditingRoom(null);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomForm({
      room_number: room.room_number,
      floor: room.floor || 0,
      sharing_type: room.sharing_type || '',
      capacity: room.capacity,
      price: room.price,
      price_per_seat: room.price_per_seat || 0,
      room_size: room.room_size || 0,
      room_description: room.room_description || '',
      furnishing_status: room.furnishing_status || '',
      has_attached_bathroom: room.has_attached_bathroom,
      has_balcony: room.has_balcony,
      room_amenities: room.room_amenities || [],
      room_images: room.room_images || [],
    });
    setDialogOpen(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const { error } = await supabase.from('rooms').delete().eq('id', roomId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Room deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete room:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete room',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async () => {
    if (!roomForm.room_number) {
      toast({
        title: 'Validation Error',
        description: 'Please enter room number',
        variant: 'destructive',
      });
      return;
    }

    // Validate floor selection
    if (roomForm.floor === null || roomForm.floor === undefined) {
      toast({
        title: 'Validation Error',
        description: 'Please select a floor',
        variant: 'destructive',
      });
      return;
    }

    // Check if adding a new room would exceed total rooms limit
    if (!editingRoom && !canAddMoreRooms) {
      toast({
        title: 'Room Limit Reached',
        description: `You can only add ${totalRoomsAllowed} rooms (${property?.number_of_floors} floors × ${property?.rooms_per_floor} rooms per floor)`,
        variant: 'destructive',
      });
      return;
    }

    // Check if the selected floor has reached its limit
    const selectedFloorData = availableFloors.find(f => f.floor === roomForm.floor);
    if (!editingRoom && selectedFloorData && selectedFloorData.available <= 0) {
      toast({
        title: 'Floor Full',
        description: `Floor ${roomForm.floor} already has ${selectedFloorData.total} rooms. Please select another floor.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const roomData: any = {
        property_id: id!,
        room_number: roomForm.room_number,
        floor: roomForm.floor,
        sharing_type: roomForm.sharing_type || null,
        capacity: roomForm.capacity,
        price: roomForm.price,
        price_per_seat: roomForm.price_per_seat || null,
        room_size: roomForm.room_size || null,
        room_description: roomForm.room_description || null,
        furnishing_status: roomForm.furnishing_status || null,
        has_attached_bathroom: roomForm.has_attached_bathroom,
        has_balcony: roomForm.has_balcony,
        room_amenities: roomForm.room_amenities.length > 0 ? roomForm.room_amenities : null,
        room_images: roomForm.room_images.length > 0 ? roomForm.room_images : null,
        is_occupied: false,
        occupied_seats: 0,
      };

      if (editingRoom) {
        const result = await supabase
          .from('rooms')
          // @ts-expect-error - Supabase type inference issue with dynamic fields
          .update(roomData)
          .eq('id', editingRoom.id);

        if (result.error) throw result.error;

        toast({
          title: 'Success',
          description: 'Room updated successfully',
        });
      } else {
        // @ts-expect-error - Supabase type inference issue with dynamic fields
        const result = await supabase.from('rooms').insert([roomData]);

        if (result.error) throw result.error;

        toast({
          title: 'Success',
          description: 'Room added successfully',
        });
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to save room:', error);
      toast({
        title: 'Error',
        description: 'Failed to save room',
        variant: 'destructive',
      });
    }
  };

  const isPGOrHostel = property?.property_type === 'pg' || property?.property_type === 'hostel';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl xl:text-3xl font-bold text-foreground">
              Room Management
            </h1>
            <p className="text-muted-foreground">{property?.name}</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              disabled={!canAddMoreRooms || availableFloors.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
              <DialogDescription>
                Fill in the room details below
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Basic Information</h3>
                
                {/* Property Configuration Info */}
                {property && (
                  <div className="p-4 bg-muted rounded-lg border">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">Property Configuration</p>
                        <p className="text-muted-foreground mt-1">
                          {property.number_of_floors} {property.number_of_floors === 1 ? 'Floor' : 'Floors'} × 
                          {' '}{property.rooms_per_floor} Rooms = 
                          {' '}{totalRoomsAllowed} Total Rooms
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{rooms.length}/{totalRoomsAllowed}</p>
                        <p className="text-xs text-muted-foreground">Rooms Added</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show warning if no rooms can be added */}
                {!canAddMoreRooms && !editingRoom && (
                  <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ Room limit reached! You have added all {totalRoomsAllowed} rooms allowed for this property.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      To add more rooms, update the property's floor and room configuration.
                    </p>
                  </div>
                )}

                {/* Show warning if no floors available */}
                {availableFloors.length === 0 && !editingRoom && canAddMoreRooms && (
                  <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                    <p className="text-sm text-warning font-medium">
                      ⚠️ All floors are full! Each floor has reached its {property?.rooms_per_floor} room limit.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room_number">Room Number *</Label>
                    <Input
                      id="room_number"
                      placeholder="e.g., 101"
                      value={roomForm.room_number}
                      onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor *</Label>
                    {availableFloors.length > 0 ? (
                      <Select
                        value={roomForm.floor?.toString() || ''}
                        onValueChange={(value) =>
                          setRoomForm({ ...roomForm, floor: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select floor" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFloors.map((floorData) => (
                            <SelectItem key={floorData.floor} value={floorData.floor.toString()}>
                              {floorData.floor === 0 ? 'Ground Floor' : `Floor ${floorData.floor}`}
                              {' '}({floorData.available}/{floorData.total} available)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="floor"
                        type="number"
                        placeholder="No floors available"
                        disabled
                        className="bg-muted"
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {availableFloors.length > 0 
                        ? 'Only floors with available space are shown'
                        : 'All floors are full or property not configured'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sharing & Capacity (for PG/Hostel) */}
              {isPGOrHostel && (
                <div className="space-y-4 p-4 bg-accent rounded-lg">
                  <h3 className="font-semibold text-primary">Sharing Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sharing_type">Sharing Type *</Label>
                      <Select
                        value={roomForm.sharing_type}
                        onValueChange={(value) => {
                          const sharingType = SHARING_TYPES.find((t) => t.value === value);
                          const capacity =
                            value === 'single'
                              ? 1
                              : value === 'double'
                              ? 2
                              : value === 'triple'
                              ? 3
                              : value === 'quad'
                              ? 4
                              : 5;
                          setRoomForm({
                            ...roomForm,
                            sharing_type: value,
                            capacity,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sharing type" />
                        </SelectTrigger>
                        <SelectContent>
                          {SHARING_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity (Seats)</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        value={roomForm.capacity}
                        onChange={(e) =>
                          setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 1 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price_per_seat">Price Per Seat (₹/month) *</Label>
                      <Input
                        id="price_per_seat"
                        type="number"
                        min="0"
                        placeholder="e.g., 8000"
                        value={roomForm.price_per_seat || ''}
                        onChange={(e) =>
                          setRoomForm({
                            ...roomForm,
                            price_per_seat: parseInt(e.target.value) || 0,
                            price: (parseInt(e.target.value) || 0) * roomForm.capacity,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total_price">Total Room Price (₹/month)</Label>
                      <Input
                        id="total_price"
                        type="number"
                        value={roomForm.price}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Calculated: {roomForm.price_per_seat} × {roomForm.capacity} seats
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Price (for non-PG/Hostel) */}
              {!isPGOrHostel && (
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Rent (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    placeholder="e.g., 15000"
                    value={roomForm.price || ''}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, price: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              )}

              {/* Room Details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Room Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room_size">Room Size (sq ft)</Label>
                    <Input
                      id="room_size"
                      type="number"
                      min="0"
                      placeholder="e.g., 150"
                      value={roomForm.room_size || ''}
                      onChange={(e) =>
                        setRoomForm({ ...roomForm, room_size: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="furnishing_status">Furnishing Status</Label>
                    <Select
                      value={roomForm.furnishing_status}
                      onValueChange={(value) =>
                        setRoomForm({ ...roomForm, furnishing_status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select furnishing" />
                      </SelectTrigger>
                      <SelectContent>
                        {FURNISHING_STATUS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room_description">Room Description</Label>
                  <Textarea
                    id="room_description"
                    placeholder="Describe the room features..."
                    value={roomForm.room_description}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, room_description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_attached_bathroom"
                      checked={roomForm.has_attached_bathroom}
                      onCheckedChange={(checked) =>
                        setRoomForm({ ...roomForm, has_attached_bathroom: checked as boolean })
                      }
                    />
                    <Label htmlFor="has_attached_bathroom" className="cursor-pointer">
                      Attached Bathroom
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_balcony"
                      checked={roomForm.has_balcony}
                      onCheckedChange={(checked) =>
                        setRoomForm({ ...roomForm, has_balcony: checked as boolean })
                      }
                    />
                    <Label htmlFor="has_balcony" className="cursor-pointer">
                      Balcony
                    </Label>
                  </div>
                </div>
              </div>

              {/* Room Amenities */}
              <div className="space-y-4">
                <h3 className="font-semibold">Room Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {ROOM_AMENITIES.map((amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`room_${amenity.id}`}
                        checked={roomForm.room_amenities.includes(amenity.id)}
                        onCheckedChange={() => handleAmenityToggle(amenity.id)}
                      />
                      <Label
                        htmlFor={`room_${amenity.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {amenity.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Images */}
              <div className="space-y-4">
                <h3 className="font-semibold">Room Images</h3>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="room-image-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="room-image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload room images
                      </p>
                    </div>
                  </label>
                </div>

                {roomForm.room_images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {roomForm.room_images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Room ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Property Info Card */}
      {property && (
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
            <CardDescription>
              {property.property_type.toUpperCase()} • {property.city}, {property.state}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DoorOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Rooms</p>
                  <p className="text-xl font-bold">{property.total_rooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rooms Added</p>
                  <p className="text-xl font-bold">{rooms.length}</p>
                </div>
              </div>
              {property.bhk_type && (
                <div>
                  <p className="text-sm text-muted-foreground">BHK Type</p>
                  <p className="font-semibold">{property.bhk_type}</p>
                </div>
              )}
              {property.meal_plan && (
                <div>
                  <p className="text-sm text-muted-foreground">Meal Plan</p>
                  <p className="font-semibold capitalize">{property.meal_plan.replace('_', ' ')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rooms List */}
      <Card>
        <CardHeader>
          <CardTitle>Rooms ({rooms.length})</CardTitle>
          <CardDescription>
            Manage individual rooms and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Loading rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <DoorOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Rooms Added Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding rooms to your property
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Room
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <Card key={room.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">Room {room.room_number}</h3>
                        {room.floor !== null && (
                          <p className="text-sm text-muted-foreground">Floor {room.floor}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRoom(room)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {room.room_images && room.room_images.length > 0 && (
                      <img
                        src={room.room_images[0]}
                        alt={`Room ${room.room_number}`}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}

                    <div className="space-y-2">
                      {room.sharing_type && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Sharing:</span>
                          <Badge variant="secondary" className="capitalize">
                            {room.sharing_type}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Capacity:</span>
                        <span className="font-semibold">{room.capacity} seats</span>
                      </div>
                      {room.price_per_seat && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Per Seat:</span>
                          <span className="font-semibold text-primary">
                            ₹{room.price_per_seat.toLocaleString()}/month
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Price:</span>
                        <span className="font-bold text-lg">
                          ₹{room.price.toLocaleString()}/month
                        </span>
                      </div>
                      {room.room_size && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Size:</span>
                          <span className="font-semibold">{room.room_size} sq ft</span>
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap mt-2">
                        {room.has_attached_bathroom && (
                          <Badge variant="outline" className="text-xs">
                            Attached Bathroom
                          </Badge>
                        )}
                        {room.has_balcony && (
                          <Badge variant="outline" className="text-xs">
                            Balcony
                          </Badge>
                        )}
                        {room.furnishing_status && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {room.furnishing_status.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {rooms.length > 0 && (
        <div className="flex justify-end">
          <Link to="/properties">
            <Button variant="outline">
              Done - Back to Properties
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
