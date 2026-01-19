import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest, getProperties } from '@/db/api';
import type { MaintenanceRequest, MaintenanceStatus, Property } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import { Plus, Wrench } from 'lucide-react';

const statusOptions: { value: MaintenanceStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function Maintenance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | null>(null);
  const [requestForm, setRequestForm] = useState({
    property_id: '',
    title: '',
    description: '',
    status: 'pending' as MaintenanceStatus,
    priority: 'medium',
    assigned_to: '',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsData, propertiesData] = await Promise.all([
        getMaintenanceRequests(),
        getProperties(user!.id),
      ]);
      setRequests(requestsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (request?: MaintenanceRequest) => {
    if (request) {
      setEditingRequest(request);
      setRequestForm({
        property_id: request.property_id,
        title: request.title,
        description: request.description,
        status: request.status,
        priority: request.priority || 'medium',
        assigned_to: request.assigned_to || '',
      });
    } else {
      setEditingRequest(null);
      setRequestForm({
        property_id: '',
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        assigned_to: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSaveRequest = async () => {
    try {
      const requestData = {
        property_id: requestForm.property_id,
        title: requestForm.title,
        description: requestForm.description,
        status: requestForm.status,
        priority: requestForm.priority || null,
        assigned_to: requestForm.assigned_to || null,
        resolved_at: requestForm.status === 'completed' ? new Date().toISOString() : null,
      };

      if (editingRequest) {
        await updateMaintenanceRequest(editingRequest.id, requestData);
        toast({
          title: 'Success',
          description: 'Maintenance request updated successfully',
        });
      } else {
        await createMaintenanceRequest(requestData);
        toast({
          title: 'Success',
          description: 'Maintenance request created successfully',
        });
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save request:', error);
      toast({
        title: 'Error',
        description: 'Failed to save maintenance request',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    const variants: Record<MaintenanceStatus, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-secondary',
      medium: 'bg-info',
      high: 'bg-warning',
      urgent: 'bg-destructive',
    };
    return (
      <Badge className={colors[priority] || 'bg-secondary'}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Maintenance</h1>
          <p className="text-muted-foreground mt-1">Manage maintenance requests</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRequest ? 'Edit Maintenance Request' : 'Add Maintenance Request'}
              </DialogTitle>
              <DialogDescription>
                {editingRequest ? 'Update request information' : 'Create a new maintenance request'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="property_id">Property *</Label>
                <Select
                  value={requestForm.property_id}
                  onValueChange={(value) => setRequestForm({ ...requestForm, property_id: value })}
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
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={requestForm.status}
                    onValueChange={(value: MaintenanceStatus) =>
                      setRequestForm({ ...requestForm, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={requestForm.priority}
                    onValueChange={(value) => setRequestForm({ ...requestForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Input
                  id="assigned_to"
                  value={requestForm.assigned_to}
                  onChange={(e) => setRequestForm({ ...requestForm, assigned_to: e.target.value })}
                  placeholder="Name of person assigned"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveRequest}>
                {editingRequest ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Maintenance Requests</h3>
              <p className="text-muted-foreground">Add your first maintenance request</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.title}</TableCell>
                      <TableCell>{request.property?.name || 'N/A'}</TableCell>
                      <TableCell>{getPriorityBadge(request.priority || 'medium')}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{request.assigned_to || '-'}</TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(request)}
                        >
                          Edit
                        </Button>
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