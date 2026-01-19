import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createProperty, updateProperty, getPropertyById } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { Property, PropertyType } from '@/types';
import { useFormPersistence } from '@/hooks/useFormPersistence';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check, Upload, X, Loader2, Save, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { INDIAN_STATES_CITIES, PROPERTY_AMENITIES, FURNISHING_STATUS, TENANT_TYPES, PROPERTY_AGE, BHK_TYPES, MEAL_PLANS } from '@/data/indiaData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'pg', label: 'PG (Paying Guest)' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'flat', label: 'Flat/Apartment' },
  { value: 'mess', label: 'Mess' },
  { value: 'vacant_room', label: 'Vacant Room' },
];

const STEPS = [
  { id: 1, title: 'Basic Information', description: 'Property name and type' },
  { id: 2, title: 'Location Details', description: 'Address and location' },
  { id: 3, title: 'Property Details', description: 'Rooms and pricing' },
  { id: 4, title: 'Amenities & Features', description: 'Facilities and amenities' },
  { id: 5, title: 'Additional Information', description: 'Rules and policies' },
  { id: 6, title: 'Images', description: 'Property photos' },
];

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedDraft, setSavedDraft] = useState<{ formData: any; timestamp: string } | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    name: '',
    property_type: 'pg' as PropertyType,
    description: '',

    // Step 2: Location
    state: '',
    city: '',
    address: '',
    pincode: '',

    // Step 3: Property Details
    number_of_floors: 1,
    rooms_per_floor: 1,
    total_rooms: 1,
    monthly_rent: 0,
    security_deposit: 0,
    maintenance_charges: 0,
    furnishing_status: '',
    property_age: '',
    
    // Property-specific fields
    bhk_type: '',
    property_size: 0,
    meal_plan: '',
    dormitory_capacity: 0,
    food_included: false,

    // Step 4: Amenities
    amenities: [] as string[],

    // Step 5: Additional Information
    preferred_tenant: '',
    property_rules: '',
    notice_period: '',
    availability_date: '',
    contact_number: '',
    contact_email: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Form persistence hook
  const { saveToStorage, loadFromStorage, clearStorage } = useFormPersistence(formData, {
    key: `property-form-draft-${user?.id || 'guest'}`,
    debounceMs: 2000,
  });

  // Check for saved draft on mount
  useEffect(() => {
    if (!id && user) {
      const draft = loadFromStorage();
      if (draft) {
        setSavedDraft(draft);
        setShowResumeDialog(true);
      }
    }
  }, [id, user, loadFromStorage]);

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  useEffect(() => {
    if (formData.state) {
      setAvailableCities(INDIAN_STATES_CITIES[formData.state as keyof typeof INDIAN_STATES_CITIES] || []);
    } else {
      setAvailableCities([]);
    }
  }, [formData.state]);

  const loadProperty = async () => {
    try {
      const property = await getPropertyById(id!);
      if (property) {
        setFormData({
          name: property.name,
          property_type: property.property_type,
          description: property.description || '',
          state: property.state,
          city: property.city,
          address: property.address,
          pincode: property.pincode,
          number_of_floors: property.number_of_floors || 1,
          rooms_per_floor: property.rooms_per_floor || 1,
          total_rooms: property.total_rooms,
          monthly_rent: 0,
          security_deposit: 0,
          maintenance_charges: 0,
          furnishing_status: '',
          property_age: '',
          bhk_type: property.bhk_type || '',
          property_size: property.property_size || 0,
          meal_plan: property.meal_plan || '',
          dormitory_capacity: property.dormitory_capacity || 0,
          food_included: property.food_included || false,
          amenities: property.amenities || [],
          preferred_tenant: '',
          property_rules: '',
          notice_period: '',
          availability_date: '',
          contact_number: '',
          contact_email: '',
        });
        setImages(property.images || []);
      }
    } catch (error) {
      console.error('Failed to load property:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property',
        variant: 'destructive',
      });
    }
  };

  const handleResumeDraft = () => {
    if (savedDraft) {
      setFormData(savedDraft.formData);
      setShowResumeDialog(false);
      toast({
        title: 'Draft Restored',
        description: 'Your previous progress has been restored',
      });
    }
  };

  const handleDiscardDraft = () => {
    clearStorage();
    setSavedDraft(null);
    setShowResumeDialog(false);
    toast({
      title: 'Draft Discarded',
      description: 'Starting with a fresh form',
    });
  };

  const handleSaveDraft = () => {
    saveToStorage(formData);
    const now = new Date().toLocaleString();
    setLastSaved(now);
    toast({
      title: 'Draft Saved',
      description: 'Your progress has been saved',
    });
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
      setProgress(0);

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

      setImages([...images, urlData.publicUrl]);
      setProgress(100);
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
      setProgress(0);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((id) => id !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.property_type) {
          toast({
            title: 'Validation Error',
            description: 'Please fill in all required fields',
            variant: 'destructive',
          });
          return false;
        }
        break;
      case 2:
        if (!formData.state || !formData.city || !formData.address || !formData.pincode) {
          toast({
            title: 'Validation Error',
            description: 'Please fill in all location details',
            variant: 'destructive',
          });
          return false;
        }
        break;
      case 3:
        if (formData.total_rooms <= 0) {
          toast({
            title: 'Validation Error',
            description: 'Please enter valid property details',
            variant: 'destructive',
          });
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const propertyData: Partial<Property> = {
        owner_id: user!.id,
        name: formData.name,
        property_type: formData.property_type,
        description: formData.description || null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        number_of_floors: formData.number_of_floors,
        rooms_per_floor: formData.rooms_per_floor,
        total_rooms: formData.total_rooms,
        amenities: formData.amenities.length > 0 ? formData.amenities : null,
        images: images.length > 0 ? images : null,
        bhk_type: formData.bhk_type || null,
        property_size: formData.property_size || null,
        meal_plan: formData.meal_plan || null,
        dormitory_capacity: formData.dormitory_capacity || null,
        food_included: formData.food_included,
      };

      if (id) {
        await updateProperty(id, propertyData);
        toast({
          title: 'Success',
          description: 'Property updated successfully',
        });
        // Clear draft after successful update
        clearStorage();
      } else {
        const newProperty = await createProperty(propertyData);
        toast({
          title: 'Success',
          description: 'Property created successfully! You can now add rooms.',
        });
        // Clear draft after successful creation
        clearStorage();
        // Redirect to room management
        navigate(`/properties/${newProperty.id}/rooms`);
        return;
      }

      navigate('/properties');
    } catch (error) {
      console.error('Failed to save property:', error);
      toast({
        title: 'Error',
        description: 'Failed to save property',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Resume Draft Dialog */}
      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resume Previous Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              We found a saved draft from {savedDraft && formatTimestamp(savedDraft.timestamp)}. 
              Would you like to continue where you left off?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardDraft}>
              Start Fresh
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleResumeDraft}>
              Resume Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl xl:text-3xl font-bold text-foreground">
              {id ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>
        </div>
        {!id && (
          <div className="flex items-center gap-2">
            {lastSaved && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                Saved {formatTimestamp(lastSaved)}
              </Badge>
            )}
            <Button variant="outline" onClick={handleSaveDraft} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-2" />
            <div className="grid grid-cols-2 xl:grid-cols-6 gap-2">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`text-center p-2 rounded-lg transition-all ${
                    step.id === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.id < currentStep
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {step.id < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="font-bold">{step.id}</span>
                    )}
                    <span className="text-xs hidden xl:inline">{step.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sunshine PG for Boys"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type *</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value: PropertyType) =>
                    setFormData({ ...formData, property_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 2: Location Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => {
                      setFormData({ ...formData, state: value, city: '' });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(INDIAN_STATES_CITIES).map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                    disabled={!formData.state}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete address with landmarks"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  placeholder="e.g., 110001"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Property Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Property Type Specific Fields */}
              {formData.property_type === 'flat' && (
                <div className="p-4 bg-accent rounded-lg border-2 border-primary/20">
                  <h3 className="font-semibold mb-4 text-primary">Flat/Apartment Details</h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bhk_type">BHK Type *</Label>
                      <Select
                        value={formData.bhk_type}
                        onValueChange={(value) => setFormData({ ...formData, bhk_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select BHK type" />
                        </SelectTrigger>
                        <SelectContent>
                          {BHK_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="property_size">Property Size (sq ft)</Label>
                      <Input
                        id="property_size"
                        type="number"
                        min="0"
                        placeholder="e.g., 1200"
                        value={formData.property_size || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, property_size: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.property_type === 'mess' && (
                <div className="p-4 bg-accent rounded-lg border-2 border-primary/20">
                  <h3 className="font-semibold mb-4 text-primary">Mess Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="meal_plan">Meal Plan *</Label>
                    <Select
                      value={formData.meal_plan}
                      onValueChange={(value) => setFormData({ ...formData, meal_plan: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select meal plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEAL_PLANS.map((plan) => (
                          <SelectItem key={plan.value} value={plan.value}>
                            {plan.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {formData.property_type === 'hostel' && (
                <div className="p-4 bg-accent rounded-lg border-2 border-primary/20">
                  <h3 className="font-semibold mb-4 text-primary">Hostel Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="dormitory_capacity">Total Dormitory Capacity</Label>
                    <Input
                      id="dormitory_capacity"
                      type="number"
                      min="0"
                      placeholder="e.g., 50"
                      value={formData.dormitory_capacity || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, dormitory_capacity: parseInt(e.target.value) || 0 })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Total number of beds available across all dormitories
                    </p>
                  </div>
                </div>
              )}

              {formData.property_type === 'pg' && (
                <div className="p-4 bg-secondary/10 rounded-lg border-2 border-secondary/20">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="p-2 bg-secondary rounded-lg">
                      <Check className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary">PG Amenities</h3>
                      <div className="mt-3 flex items-center space-x-2">
                        <Checkbox
                          id="food_included"
                          checked={formData.food_included}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, food_included: checked as boolean })
                          }
                        />
                        <Label htmlFor="food_included" className="cursor-pointer font-normal">
                          Food/Meals Included
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Check this if food is provided as part of the PG accommodation
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(formData.property_type === 'pg' || formData.property_type === 'hostel') && (
                <div className="p-4 bg-secondary/10 rounded-lg border-2 border-secondary/20">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="p-2 bg-secondary rounded-lg">
                      <Check className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary">Room Configuration</h3>
                      <p className="text-sm text-muted-foreground">
                        You'll be able to add individual rooms with sharing types and per-seat pricing after creating the property
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Fields */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Floor & Room Configuration</h3>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number_of_floors">Number of Floors *</Label>
                    <Input
                      id="number_of_floors"
                      type="number"
                      min="1"
                      placeholder="e.g., 3"
                      value={formData.number_of_floors}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string temporarily, or parse the number
                        if (value === '') {
                          setFormData({
                            ...formData,
                            number_of_floors: 1,
                            total_rooms: 1 * formData.rooms_per_floor,
                          });
                        } else {
                          const floors = parseInt(value);
                          if (!isNaN(floors) && floors > 0) {
                            setFormData({
                              ...formData,
                              number_of_floors: floors,
                              total_rooms: floors * formData.rooms_per_floor,
                            });
                          }
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rooms_per_floor">Rooms per Floor *</Label>
                    <Input
                      id="rooms_per_floor"
                      type="number"
                      min="1"
                      placeholder="e.g., 4"
                      value={formData.rooms_per_floor}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string temporarily, or parse the number
                        if (value === '') {
                          setFormData({
                            ...formData,
                            rooms_per_floor: 1,
                            total_rooms: formData.number_of_floors * 1,
                          });
                        } else {
                          const roomsPerFloor = parseInt(value);
                          if (!isNaN(roomsPerFloor) && roomsPerFloor > 0) {
                            setFormData({
                              ...formData,
                              rooms_per_floor: roomsPerFloor,
                              total_rooms: formData.number_of_floors * roomsPerFloor,
                            });
                          }
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_rooms">Total Rooms (Auto-calculated)</Label>
                    <Input
                      id="total_rooms"
                      type="number"
                      value={formData.total_rooms}
                      disabled
                      className="bg-muted font-semibold"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.number_of_floors} floors × {formData.rooms_per_floor} rooms = {formData.total_rooms} total
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Pricing Information</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly_rent">
                      {formData.property_type === 'pg' || formData.property_type === 'hostel'
                        ? 'Starting Rent (₹/month)'
                        : 'Monthly Rent (₹)'}
                    </Label>
                    <Input
                      id="monthly_rent"
                      type="number"
                      min="0"
                      placeholder="e.g., 8000"
                      value={formData.monthly_rent || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, monthly_rent: parseInt(e.target.value) || 0 })
                      }
                    />
                    {(formData.property_type === 'pg' || formData.property_type === 'hostel') && (
                      <p className="text-xs text-muted-foreground">
                        Base rent for single occupancy (you can set different rates per room later)
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="security_deposit">Security Deposit (₹)</Label>
                    <Input
                      id="security_deposit"
                      type="number"
                      min="0"
                      placeholder="e.g., 10000"
                      value={formData.security_deposit || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, security_deposit: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance_charges">Maintenance Charges (₹/month)</Label>
                    <Input
                      id="maintenance_charges"
                      type="number"
                      min="0"
                      placeholder="e.g., 1000"
                      value={formData.maintenance_charges || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maintenance_charges: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="furnishing_status">Furnishing Status</Label>
                    <Select
                      value={formData.furnishing_status}
                      onValueChange={(value) => setFormData({ ...formData, furnishing_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select furnishing status" />
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
                  <div className="space-y-2">
                    <Label htmlFor="property_age">Property Age</Label>
                    <Select
                      value={formData.property_age}
                      onValueChange={(value) => setFormData({ ...formData, property_age: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property age" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_AGE.map((age) => (
                          <SelectItem key={age.value} value={age.value}>
                            {age.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Amenities & Features */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Label>Select Amenities</Label>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {PROPERTY_AMENITIES.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity.id}
                      checked={formData.amenities.includes(amenity.id)}
                      onCheckedChange={() => handleAmenityToggle(amenity.id)}
                    />
                    <Label
                      htmlFor={amenity.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Additional Information */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferred_tenant">Preferred Tenant Type</Label>
                  <Select
                    value={formData.preferred_tenant}
                    onValueChange={(value) => setFormData({ ...formData, preferred_tenant: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TENANT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notice_period">Notice Period (days)</Label>
                  <Input
                    id="notice_period"
                    placeholder="e.g., 30"
                    value={formData.notice_period}
                    onChange={(e) => setFormData({ ...formData, notice_period: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability_date">Available From</Label>
                  <Input
                    id="availability_date"
                    type="date"
                    value={formData.availability_date}
                    onChange={(e) =>
                      setFormData({ ...formData, availability_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    type="tel"
                    placeholder="e.g., +91 9876543210"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="e.g., owner@example.com"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_rules">Property Rules & Policies</Label>
                <Textarea
                  id="property_rules"
                  placeholder="Enter property rules, policies, and any other important information..."
                  value={formData.property_rules}
                  onChange={(e) => setFormData({ ...formData, property_rules: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 6: Images */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Property Images</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload property images
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP up to 10MB (auto-compressed)
                      </p>
                    </div>
                  </label>
                </div>
                {uploading && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-center text-muted-foreground">Uploading...</p>
                  </div>
                )}
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || loading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {STEPS.length}
        </div>
        {currentStep < STEPS.length ? (
          <Button onClick={nextStep} disabled={loading}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {id ? 'Update Property' : 'Create Property'}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
