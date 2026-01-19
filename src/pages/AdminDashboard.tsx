import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllPropertiesForAdmin, verifyProperty, rejectPropertyVerification, checkIsAdmin, syncPropertyToWebsite } from '@/db/api';
import type { Property } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  Building2,
  User,
  MapPin,
  Calendar,
  Filter,
  Globe,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'unverified'>('all');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      const adminStatus = await checkIsAdmin(user!.id);
      setIsAdmin(adminStatus);
      
      if (!adminStatus) {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      loadProperties();
    } catch (error) {
      console.error('Failed to check admin access:', error);
      navigate('/dashboard');
    }
  };

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await getAllPropertiesForAdmin();
      setProperties(data);
      setFilteredProperties(data);
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

  useEffect(() => {
    filterProperties();
  }, [filterStatus, properties]);

  const filterProperties = () => {
    let filtered = [...properties];

    if (filterStatus === 'verified') {
      filtered = filtered.filter(p => p.is_verified);
    } else if (filterStatus === 'unverified') {
      filtered = filtered.filter(p => !p.is_verified);
    }

    setFilteredProperties(filtered);
  };

  const handleVerify = async () => {
    if (!selectedProperty) return;

    try {
      setVerifying(true);
      
      // Verify property
      await verifyProperty(selectedProperty.id, user!.id, notes);
      
      toast({
        title: 'Property Verified',
        description: 'Property has been verified successfully',
      });

      // Sync to website
      toast({
        title: 'Syncing to Website',
        description: 'Syncing property to main Roomsaathi website...',
      });

      const syncResult = await syncPropertyToWebsite(selectedProperty.id);

      if (syncResult.success) {
        toast({
          title: 'Sync Successful',
          description: 'Property has been published to Roomsaathi website',
        });
      } else {
        toast({
          title: 'Sync Failed',
          description: syncResult.error || 'Failed to sync property to website. You can retry later.',
          variant: 'destructive',
        });
      }

      setVerifyDialog(false);
      setNotes('');
      setSelectedProperty(null);
      loadProperties();
    } catch (error) {
      console.error('Failed to verify property:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify property',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProperty || !notes.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      await rejectPropertyVerification(selectedProperty.id, user!.id, notes);
      toast({
        title: 'Success',
        description: 'Property verification rejected',
      });
      setRejectDialog(false);
      setNotes('');
      setSelectedProperty(null);
      loadProperties();
    } catch (error) {
      console.error('Failed to reject property:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject property',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 bg-muted" />
        <div className="grid gap-4 xl:grid-cols-3">
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
        </div>
        <Skeleton className="h-96 bg-muted" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const stats = {
    total: properties.length,
    verified: properties.filter(p => p.is_verified).length,
    pending: properties.filter(p => !p.is_verified).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage and verify property listings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Properties
            </CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified Properties
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.verified}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Verification
            </CardTitle>
            <XCircle className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('all')}
        >
          All Properties
        </Button>
        <Button
          variant={filterStatus === 'verified' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('verified')}
        >
          Verified
        </Button>
        <Button
          variant={filterStatus === 'unverified' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('unverified')}
        >
          Pending
        </Button>
      </div>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Property Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No properties found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Listed Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Website Sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="font-medium">{property.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {property.total_rooms} rooms • {property.total_floors} floors
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{property.owner?.username || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{property.owner?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{property.city}, {property.state}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {property.property_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(property.created_at), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {property.is_verified ? (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500">
                            <XCircle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {property.synced_to_website ? (
                          <Badge className="bg-blue-500">
                            <Globe className="h-3 w-3 mr-1" />
                            Synced
                          </Badge>
                        ) : property.sync_error ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        ) : property.is_verified ? (
                          <Badge variant="outline">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="secondary">-</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/properties/${property.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!property.is_verified && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedProperty(property);
                                  setVerifyDialog(true);
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedProperty(property);
                                  setRejectDialog(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {property.is_verified && !property.synced_to_website && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                const result = await syncPropertyToWebsite(property.id);
                                if (result.success) {
                                  toast({
                                    title: 'Sync Successful',
                                    description: 'Property synced to website',
                                  });
                                  loadProperties();
                                } else {
                                  toast({
                                    title: 'Sync Failed',
                                    description: result.error,
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Sync
                            </Button>
                          )}
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

      {/* Verify Dialog */}
      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Property</DialogTitle>
            <DialogDescription>
              Confirm verification for {selectedProperty?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="verify_notes">Notes (Optional)</Label>
              <Textarea
                id="verify_notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this verification"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialog(false)} disabled={verifying}>
              Cancel
            </Button>
            <Button onClick={handleVerify} disabled={verifying}>
              {verifying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying & Syncing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify & Sync to Website
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedProperty?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject_notes">Reason for Rejection *</Label>
              <Textarea
                id="reject_notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain why this property cannot be verified"
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
