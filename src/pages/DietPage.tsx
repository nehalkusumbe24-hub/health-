import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Leaf, Apple, Coffee, Utensils } from 'lucide-react';
import type { DietPlan } from '@/types';

export default function DietPage() {
  const { profile } = useAuth();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDietPlan = async () => {
      if (!profile?.id) return;

      try {
        const plan = await api.dietPlans.getActiveByUser(profile.id);
        setDietPlan(plan);
      } catch (error) {
        console.error('Failed to load diet plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDietPlan();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full bg-muted" />
        <Skeleton className="h-64 w-full bg-muted" />
      </div>
    );
  }

  if (!dietPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Diet Plan Yet</CardTitle>
          <CardDescription>
            Complete your health assessment to receive a personalized diet plan from our doctors
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const mealTimes = [
    { icon: Coffee, label: 'Breakfast', key: 'breakfast' },
    { icon: Utensils, label: 'Lunch', key: 'lunch' },
    { icon: Apple, label: 'Snacks', key: 'snacks' },
    { icon: Utensils, label: 'Dinner', key: 'dinner' },
  ];

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden glass-effect border-primary/20">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d4f1d9c7-acfa-4504-b7f1-514307bf6c6e.jpg" 
            alt="Healthy Ayurvedic food background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-20" />
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shadow-lg">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{dietPlan.title}</CardTitle>
              <CardDescription className="text-base">
                {dietPlan.description || 'Personalized for your dosha balance'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {dietPlan.primary_dosha && (
          <CardContent className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Optimized for:</span>
              <Badge variant="secondary" className="capitalize shadow-sm">
                {dietPlan.primary_dosha} Dosha
              </Badge>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle>Daily Meal Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mealTimes.map((meal) => {
            const mealData = dietPlan.daily_menu?.[meal.key];
            if (!mealData) return null;

            return (
              <div key={meal.key} className="border rounded-lg p-4 glass-effect hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center shadow-sm">
                    <meal.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{meal.label}</h3>
                </div>
                <p className="text-muted-foreground">{mealData}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {dietPlan.food_restrictions && dietPlan.food_restrictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Foods to Avoid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dietPlan.food_restrictions.map((food, index) => (
                <Badge key={index} variant="destructive">
                  {food}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {dietPlan.seasonal_recommendations && Object.keys(dietPlan.seasonal_recommendations).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(dietPlan.seasonal_recommendations).map(([season, recommendation]) => (
              <div key={season} className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold capitalize mb-1">{season}</h4>
                <p className="text-sm text-muted-foreground">{recommendation as string}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
