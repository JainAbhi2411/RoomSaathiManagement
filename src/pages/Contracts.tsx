import { useEffect, useState } from 'react';
import { getContracts, createContract, updateContract, getBookings, getTenants, getProperties } from '@/db/api';
import type { Contract, Booking, Tenant, Property } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, FileText } from 'lucide-react';

export default function Contracts() {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [contractForm, setContractForm] = useState({
    booking_id: '',
    tenant_id: '',
    property_id: '',
    start_date: '',
    end_date: '',
    monthly_rent: 0,
    security_deposit: 0,
    terms: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contractsData, bookingsData, tenantsData, propertiesData] = await Promise.all([
        getContracts(),
        getBookings(),
        getTenants(),
        getProperties(),
      ]);
      setContracts(contractsData);
      setBookings(bookingsData);
      setTenants(tenantsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (contract?: Contract) => {
    if (contract) {
      setEditingContract(contract);
      setContractForm({
        booking_id: contract.booking_id,
        tenant_id: contract.tenant_id,
        property_id: contract.property_id,
        start_date: contract.start_date,
        end_date: contract.end_date,
        monthly_rent: contract.monthly_rent,
        security_deposit: contract.security_deposit || 0,
        terms: contract.terms || '',
      });
    } else {
      setEditingContract(null);
      setContractForm({
        booking_id: '',
        tenant_id: '',
        property_id: '',
        start_date: '',
        end_date: '',
        monthly_rent: 0,
        security_deposit: 0,
        terms: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSaveContract = async () => {
    try {
      const contractData = {
        booking_id: contractForm.booking_id,
        tenant_id: contractForm.tenant_id,
        property_id: contractForm.property_id,
        start_date: contractForm.start_date,
        end_date: contractForm.end_date,
        monthly_rent: contractForm.monthly_rent,
        security_deposit: contractForm.security_deposit || null,
        terms: contractForm.terms || null,
      };

      if (editingContract) {
        await updateContract(editingContract.id, contractData);
        toast({
          title: 'Success',
          description: 'Contract updated successfully',
        });
      } else {
        await createContract(contractData);
        toast({
          title: 'Success',
          description: 'Contract created successfully',
        });
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save contract:', error);
      toast({
        title: 'Error',
        description: 'Failed to save contract',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Contracts</h1>
          <p className="text-muted-foreground mt-1">Manage rental contracts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingContract ? 'Edit Contract' : 'Add Contract'}</DialogTitle>
              <DialogDescription>
                {editingContract ? 'Update contract information' : 'Create a new rental contract'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="booking_id">Booking *</Label>
                  <Select
                    value={contractForm.booking_id}
                    onValueChange={(value) => {
                      const booking = bookings.find((b) => b.id === value);
                      setContractForm({
                        ...contractForm,
                        booking_id: value,
                        tenant_id: booking?.tenant_id || '',
                        property_id: booking?.property_id || '',
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a booking" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookings.map((booking) => (
                        <SelectItem key={booking.id} value={booking.id}>
                          Booking #{booking.id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property_id">Property *</Label>
                  <Select
                    value={contractForm.property_id}
                    onValueChange={(value) => setContractForm({ ...contractForm, property_id: value })}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={contractForm.start_date}
                    onChange={(e) => setContractForm({ ...contractForm, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={contractForm.end_date}
                    onChange={(e) => setContractForm({ ...contractForm, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly_rent">Monthly Rent *</Label>
                  <Input
                    id="monthly_rent"
                    type="number"
                    min="0"
                    value={contractForm.monthly_rent}
                    onChange={(e) =>
                      setContractForm({ ...contractForm, monthly_rent: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="security_deposit">Security Deposit</Label>
                  <Input
                    id="security_deposit"
                    type="number"
                    min="0"
                    value={contractForm.security_deposit}
                    onChange={(e) =>
                      setContractForm({ ...contractForm, security_deposit: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={contractForm.terms}
                  onChange={(e) => setContractForm({ ...contractForm, terms: e.target.value })}
                  rows={4}
                  placeholder="Enter contract terms and conditions"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveContract}>
                {editingContract ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contracts ({contracts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Contracts Yet</h3>
              <p className="text-muted-foreground">Add your first rental contract</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Monthly Rent</TableHead>
                    <TableHead>Security Deposit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.tenant?.full_name || 'N/A'}
                      </TableCell>
                      <TableCell>{contract.property?.name || 'N/A'}</TableCell>
                      <TableCell>{new Date(contract.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(contract.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>₹{contract.monthly_rent}</TableCell>
                      <TableCell>₹{contract.security_deposit || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(contract)}
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