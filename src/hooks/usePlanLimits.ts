import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSubscription } from '@/db/api';
import type { UserSubscription } from '@/types';

interface PlanLimits {
  maxProperties: number | null;
  maxRooms: number | null;
  features: string[];
  planName: string;
  isUnlimited: boolean;
}

export function usePlanLimits() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [limits, setLimits] = useState<PlanLimits>({
    maxProperties: null,
    maxRooms: null,
    features: [],
    planName: 'No Plan',
    isUnlimited: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      const data = await getUserSubscription(user.id);
      setSubscription(data);

      if (data && data.plan) {
        const plan = Array.isArray(data.plan) ? data.plan[0] : data.plan;
        setLimits({
          maxProperties: plan.max_properties,
          maxRooms: plan.max_rooms,
          features: plan.features || [],
          planName: plan.name,
          isUnlimited: plan.max_properties === null && plan.max_rooms === null,
        });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureName: string): boolean => {
    return limits.features.some(f => 
      f.toLowerCase().includes(featureName.toLowerCase())
    );
  };

  const canAddProperty = (currentCount: number): boolean => {
    if (limits.maxProperties === null) return true;
    return currentCount < limits.maxProperties;
  };

  const canAddRoom = (currentCount: number): boolean => {
    if (limits.maxRooms === null) return true;
    return currentCount < limits.maxRooms;
  };

  return {
    subscription,
    limits,
    loading,
    hasFeature,
    canAddProperty,
    canAddRoom,
    refresh: loadSubscription,
  };
}
