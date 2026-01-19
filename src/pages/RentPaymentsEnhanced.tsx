import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getRentPayments,
  getProperties,
  getTenants,
  markRentPaymentAsPaid,
  getRentPaymentAnalytics,
  createRentPayment,
  generateMonthlyRentPayment,
} from '@/db/api';
import type { Property, RentPayment, Tenant } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Filter,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

interface PaymentWithDetails extends RentPayment {
  tenant?: { full_name: string; phone: string };
  room?: { room_number: string };
  property?: { name: string };
}

export default function RentPaymentsEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithDetails[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Mark as Paid Dialog
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    paid_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    transaction_id: '',
    notes: '',
  });

  // Add Payment Dialog
  const [addPaymentDialog, setAddPaymentDialog] = useState(false);
  const [newPaymentForm, setNewPaymentForm] = useState({
    tenant_id: '',
    amount: '',
    due_date: '',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    filterPayments();
  }, [payments, selectedProperty, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [propertiesData, tenantsData, paymentsData] = await Promise.all([
        getProperties(user!.id),
        getTenants(),
        getRentPayments(),
      ]);
      
      setProperties(propertiesData);
      setTenants(tenantsData);
      setPayments(paymentsData as PaymentWithDetails[]);

      if (propertiesData.length > 0) {
        const analyticsData = await getRentPaymentAnalytics(propertiesData[0].id);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rent payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (selectedProperty !== 'all') {
      filtered = filtered.filter(p => p.property_id === selectedProperty);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedPayment) return;

    try {
      await markRentPaymentAsPaid(selectedPayment.id, paymentForm);
      toast({
        title: 'Success',
        description: 'Payment marked as paid successfully',
      });
      setPaymentDialog(false);
      setSelectedPayment(null);
      setPaymentForm({
        paid_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        transaction_id: '',
        notes: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to mark payment as paid:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark payment as paid',
        variant: 'destructive',
      });
    }
  };

  const handleAddPayment = async () => {
    if (!newPaymentForm.tenant_id || !newPaymentForm.amount || !newPaymentForm.due_date) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const tenant = tenants.find(t => t.id === newPaymentForm.tenant_id);
      if (!tenant || !tenant.room_id) {
        toast({
          title: 'Error',
          description: 'Tenant must be assigned to a room',
          variant: 'destructive',
        });
        return;
      }

      await createRentPayment({
        tenant_id: newPaymentForm.tenant_id,
        room_id: tenant.room_id,
        property_id: tenant.property_id,
        amount: parseFloat(newPaymentForm.amount),
        due_date: newPaymentForm.due_date,
        status: 'pending',
      });

      toast({
        title: 'Success',
        description: 'Rent payment added successfully',
      });
      
      setAddPaymentDialog(false);
      setNewPaymentForm({
        tenant_id: '',
        amount: '',
        due_date: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to add payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add rent payment',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateMonthlyPayments = async () => {
    try {
      const tenantsWithRent = tenants.filter(t => t.monthly_rent && t.move_in_date && t.room_id);
      
      if (tenantsWithRent.length === 0) {
        toast({
          title: 'Info',
          description: 'No tenants with rent information found',
        });
        return;
      }

      let generated = 0;
      for (const tenant of tenantsWithRent) {
        try {
          await generateMonthlyRentPayment(tenant.id);
          generated++;
        } catch (error) {
          console.error(`Failed to generate payment for tenant ${tenant.id}:`, error);
        }
      }

      toast({
        title: 'Success',
        description: `Generated ${generated} monthly rent payments`,
      });
      loadData();
    } catch (error) {
      console.error('Failed to generate monthly payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate monthly payments',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 bg-muted" />
        <div className="grid gap-4 xl:grid-cols-4">
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
        </div>
        <Skeleton className="h-96 bg-muted" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Properties Found</h2>
        <p className="text-muted-foreground mb-6">Add a property to start tracking rent payments</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Payments',
      value: analytics?.totalPayments || 0,
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      title: 'Paid',
      value: `₹${analytics?.paidAmount?.toLocaleString() || 0}`,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      title: 'Pending',
      value: `₹${analytics?.pendingAmount?.toLocaleString() || 0}`,
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      title: 'Overdue',
      value: `₹${analytics?.overdueAmount?.toLocaleString() || 0}`,
      icon: AlertCircle,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Rent Payments</h1>
          <p className="text-muted-foreground mt-1">Track and manage monthly rent payments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAddPaymentDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Payment
          </Button>
          <Button onClick={handleGenerateMonthlyPayments} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Generate Monthly
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Properties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map(property => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Collection Rate */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Collection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Collection</span>
                <span className="text-2xl font-bold">{analytics.collectionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${analytics.collectionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map(payment => (
                <div
                  key={payment.id}
                  className="flex flex-col xl:flex-row xl:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{payment.tenant?.full_name}</h3>
                      {getStatusBadge(payment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payment.property?.name} • Room {payment.room?.room_number}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {format(new Date(payment.due_date), 'MMM dd, yyyy')}
                      </span>
                      {payment.paid_date && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Paid: {format(new Date(payment.paid_date), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 xl:mt-0">
                    <div className="text-right">
                      <div className="text-2xl font-bold">₹{payment.amount.toLocaleString()}</div>
                      {payment.payment_method && (
                        <div className="text-xs text-muted-foreground capitalize">
                          {payment.payment_method.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                    {payment.status !== 'paid' && (
                      <Button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setPaymentDialog(true);
                        }}
                      >
                        Mark as Paid
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mark as Paid Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Payment as Paid</DialogTitle>
            <DialogDescription>
              Record payment details for {selectedPayment?.tenant?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paid_date">Payment Date</Label>
              <Input
                id="paid_date"
                type="date"
                value={paymentForm.paid_date}
                onChange={e => setPaymentForm({ ...paymentForm, paid_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={paymentForm.payment_method}
                onValueChange={value => setPaymentForm({ ...paymentForm, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transaction_id">Transaction ID (Optional)</Label>
              <Input
                id="transaction_id"
                value={paymentForm.transaction_id}
                onChange={e => setPaymentForm({ ...paymentForm, transaction_id: e.target.value })}
                placeholder="Enter transaction ID"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={paymentForm.notes}
                onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Add any notes about this payment"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsPaid}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={addPaymentDialog} onOpenChange={setAddPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Rent Payment</DialogTitle>
            <DialogDescription>
              Manually add a rent payment for a tenant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tenant_id">Select Tenant *</Label>
              <Select
                value={newPaymentForm.tenant_id}
                onValueChange={value => setNewPaymentForm({ ...newPaymentForm, tenant_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.filter(t => t.room_id).map(tenant => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.full_name} - {tenant.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                value={newPaymentForm.amount}
                onChange={e => setNewPaymentForm({ ...newPaymentForm, amount: e.target.value })}
                placeholder="Enter rent amount"
              />
            </div>
            <div>
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={newPaymentForm.due_date}
                onChange={e => setNewPaymentForm({ ...newPaymentForm, due_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPayment}>Add Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
