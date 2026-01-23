import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProperties, deleteProperty } from '@/db/api';
import type { Property } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Building2, Plus, Edit, Trash2, Eye, MapPin, Shield, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useNavigate } from 'react-router-dom';

const propertyTypeLabels: Record<string, string> = {
  pg: 'PG',
  hostel: 'Hostel',
  flat: 'Flat',
  mess: 'Mess',
  vacant_room: 'Vacant Room',
};

export default function Properties() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { limits, hasFeature, canAddProperty } = usePlanLimits();

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await getProperties(user!.id);
      setProperties(data);
    } catch (error) {
      console.error('Failed to load properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load properties',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id);
      toast({
        title: 'Success',
        description: 'Property deleted successfully',
      });
      loadProperties();
    } catch (error) {
      console.error('Failed to delete property:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete property',
        variant: 'destructive',
      });
    }
  };

  const handleAddProperty = () => {
    if (!canAddProperty(properties.length)) {
      toast({
        title: 'Plan Limit Reached',
        description: `Your ${limits.planName} allows up to ${limits.maxProperties} properties. Upgrade to add more.`,
        variant: 'destructive',
      });
      return;
    }
    navigate('/properties/new');
  };

  const handleBulkUpload = (type: 'properties' | 'rooms') => {
    if (type === 'properties' && !hasFeature('CSV Bulk Upload')) {
      toast({
        title: 'Premium Feature',
        description: 'CSV Bulk Upload is available in Premium Plan. Upgrade to unlock this feature.',
        variant: 'destructive',
      });
      return;
    }
    navigate(type === 'properties' ? '/properties/csv-upload' : '/rooms/csv-upload');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Properties</h1>
          <p className="text-muted-foreground mt-1">
            Manage your property listings
            {limits.maxProperties && (
              <span className="ml-2 text-xs">
                ({properties.length}/{limits.maxProperties} used)
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasFeature('CSV Bulk Upload') && (
            <>
              <Button onClick={() => handleBulkUpload('properties')} variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Bulk Upload Properties</span>
                <span className="sm:hidden">Bulk Upload</span>
              </Button>
              <Button onClick={() => handleBulkUpload('rooms')} variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Bulk Upload Rooms</span>
                <span className="sm:hidden">Upload Rooms</span>
              </Button>
            </>
          )}
          <Button onClick={handleAddProperty}>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
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
            <p className="text-muted-foreground text-center mb-4">
              Get started by adding your first property
            </p>
            <Link to="/properties/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{property.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {propertyTypeLabels[property.property_type]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {property.total_rooms} rooms
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {property.images && property.images.length > 0 && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {property.address}, {property.city}, {property.state} - {property.pincode}
                  </p>
                </div>
                {property.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {property.description}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link to={`/properties/${property.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </Link>
                <Link to={`/properties/edit/${property.id}`}>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Property</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this property? This action cannot be undone
                        and will also delete all associated rooms, bookings, and data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(property.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
