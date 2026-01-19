import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import type { Property } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  MessageCircle,
  Users,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppLog {
  id: string;
  action_type: string;
  phone_number: string | null;
  message: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  tenant_id: string | null;
}

export default function WhatsAppSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [ownerNumber, setOwnerNumber] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [groupInviteLink, setGroupInviteLink] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load property
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (propertyError) throw propertyError;
      if (!propertyData) {
        toast({
          title: 'Error',
          description: 'Property not found',
          variant: 'destructive',
        });
        navigate('/properties');
        return;
      }

      setProperty(propertyData);
      setWhatsappEnabled(propertyData.whatsapp_enabled || false);
      setOwnerNumber(propertyData.owner_whatsapp_number || '');
      setWelcomeMessage(
        propertyData.welcome_message_template ||
          "Welcome to {property_name}! We're glad to have you as our tenant. Your room number is {room_number}. If you have any questions, feel free to reach out. 😊"
      );
      setGroupInviteLink(propertyData.whatsapp_group_invite_link || '');

      // Load WhatsApp logs
      const { data: logsData, error: logsError } = await supabase
        .from('whatsapp_logs')
        .select('*')
        .eq('property_id', id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load WhatsApp settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (whatsappEnabled && !ownerNumber) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your WhatsApp number',
        variant: 'destructive',
      });
      return;
    }

    // Validate phone number format
    if (whatsappEnabled && ownerNumber && !ownerNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number with country code (e.g., +919876543210)',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('properties')
        .update({
          whatsapp_enabled: whatsappEnabled,
          owner_whatsapp_number: ownerNumber || null,
          welcome_message_template: welcomeMessage,
          whatsapp_group_invite_link: groupInviteLink || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'WhatsApp settings saved successfully',
      });

      loadData();
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save WhatsApp settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateGroup = async () => {
    toast({
      title: 'WhatsApp Integration Required',
      description: 'Please connect WhatsApp Business API to create groups automatically. See documentation for setup instructions.',
    });

    // Log the action
    await supabase.from('whatsapp_logs').insert([{
      property_id: id!,
      action_type: 'group_created',
      phone_number: ownerNumber,
      message: 'Group creation attempted',
      status: 'pending',
    }]);

    loadData();
  };

  const copyInviteLink = () => {
    if (groupInviteLink) {
      navigator.clipboard.writeText(groupInviteLink);
      toast({
        title: 'Copied',
        description: 'Invite link copied to clipboard',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'group_created':
        return 'Group Created';
      case 'tenant_added':
        return 'Tenant Added';
      case 'welcome_sent':
        return 'Welcome Sent';
      case 'error':
        return 'Error';
      default:
        return actionType;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64 bg-muted" />
        <Skeleton className="h-96 w-full bg-muted" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/properties/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-foreground">WhatsApp Management</h1>
          <p className="text-muted-foreground">{property?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="xl:col-span-2 space-y-6">
          {/* Enable WhatsApp */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle>WhatsApp Group Management</CardTitle>
                    <CardDescription>
                      Automatically manage tenant WhatsApp group
                    </CardDescription>
                  </div>
                </div>
                <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
              </div>
            </CardHeader>
            {whatsappEnabled && (
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-500 mb-1">WhatsApp Business API Required</p>
                      <p className="text-muted-foreground">
                        To use automatic group management, you need to connect WhatsApp Business API.
                        See documentation for setup instructions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_number">Your WhatsApp Number *</Label>
                  <Input
                    id="owner_number"
                    placeholder="+919876543210"
                    value={ownerNumber}
                    onChange={(e) => setOwnerNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code (e.g., +91 for India)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group_link">WhatsApp Group Invite Link (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="group_link"
                      placeholder="https://chat.whatsapp.com/..."
                      value={groupInviteLink}
                      onChange={(e) => setGroupInviteLink(e.target.value)}
                    />
                    {groupInviteLink && (
                      <>
                        <Button variant="outline" size="icon" onClick={copyInviteLink}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(groupInviteLink, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste your existing group invite link or create a new group
                  </p>
                </div>

                {!groupInviteLink && (
                  <Button variant="outline" onClick={handleCreateGroup} className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Create WhatsApp Group
                  </Button>
                )}
              </CardContent>
            )}
          </Card>

          {/* Welcome Message */}
          {whatsappEnabled && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Send className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Welcome Message Template</CardTitle>
                    <CardDescription>
                      Customize the message sent to new tenants
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcome_message">Message Template</Label>
                  <Textarea
                    id="welcome_message"
                    rows={6}
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Enter your welcome message..."
                  />
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>Available variables:</span>
                    <Badge variant="outline">{'{property_name}'}</Badge>
                    <Badge variant="outline">{'{room_number}'}</Badge>
                    <Badge variant="outline">{'{tenant_name}'}</Badge>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {welcomeMessage
                      .replace('{property_name}', property?.name || 'Property Name')
                      .replace('{room_number}', '101')
                      .replace('{tenant_name}', 'John Doe')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(`/properties/${id}`)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        {/* Activity Log */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent WhatsApp actions</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      {getStatusIcon(log.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {getActionLabel(log.action_type)}
                          </span>
                          <Badge
                            variant={
                              log.status === 'success'
                                ? 'default'
                                : log.status === 'failed'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className="text-xs"
                          >
                            {log.status}
                          </Badge>
                        </div>
                        {log.phone_number && (
                          <p className="text-xs text-muted-foreground truncate">
                            {log.phone_number}
                          </p>
                        )}
                        {log.message && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {log.message}
                          </p>
                        )}
                        {log.error_message && (
                          <p className="text-xs text-destructive mt-1">{log.error_message}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <p>Enable WhatsApp management and enter your number</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <p>Create or link your property WhatsApp group</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <p>New tenants are automatically added to the group</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  4
                </div>
                <p>Welcome message is sent automatically</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
