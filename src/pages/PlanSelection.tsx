import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { getActivePlans, subscribeToPlan } from '@/db/api';
import type { SubscriptionPlan } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function PlanSelection() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // If user already has a plan, redirect to dashboard
    if (profile?.current_plan_id) {
      navigate('/dashboard');
      return;
    }
    loadPlans();
  }, [profile]);

  const loadPlans = async () => {
    try {
      const data = await getActivePlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user) return;

    setSubscribing(planId);
    try {
      await subscribeToPlan(user.id, planId);
      
      toast({
        title: 'Success',
        description: 'Plan activated successfully!',
      });

      // Refresh profile to get updated plan
      await refreshProfile();
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate plan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Choose Your Plan</h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your property management needs
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {plans.map((plan) => {
            const isPopular = plan.price > 0;
            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isPopular ? 'border-2 border-primary shadow-lg' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl sm:text-3xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm sm:text-base">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-bold">₹{plan.price}</span>
                      <span className="text-muted-foreground">/ {plan.duration_days} days</span>
                    </div>
                    {plan.price === 0 && (
                      <Badge variant="secondary" className="mt-2">Free Forever</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Limits */}
                  <div className="space-y-2 pb-4 border-b">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Properties</span>
                      <span className="font-semibold">
                        {plan.max_properties ? plan.max_properties : 'Unlimited'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rooms</span>
                      <span className="font-semibold">
                        {plan.max_rooms ? plan.max_rooms : 'Unlimited'}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold mb-3">Features Included:</p>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    variant={isPopular ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={subscribing !== null}
                  >
                    {subscribing === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      'Select Plan'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>You can upgrade or change your plan anytime from your dashboard</p>
        </div>
      </div>
    </div>
  );
}
