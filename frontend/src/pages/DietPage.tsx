import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, Apple, Coffee, Utensils, ArrowRight, Flame, Droplets, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DietPlan } from '@/types';
import RemAide from '@/components/common/RemAide';

const AYURVEDIC_FOODS = [
  { name: "Turmeric (Haldi)", benefit: "Anti-inflammatory, boosts immunity, supports digestion", dosha: "All", emoji: "✨" },
  { name: "Ginger (Adrak)", benefit: "Stimulates Agni (digestive fire), reduces nausea", dosha: "Vata & Kapha", emoji: "🫚" },
  { name: "Ghee (Clarified Butter)", benefit: "Lubricates joints, nourishes tissues, enhances flavor", dosha: "All", emoji: "🧈" },
  { name: "Ashwagandha", benefit: "Reduces stress, boosts energy and immunity", dosha: "Vata & Kapha", emoji: "🌿" },
  { name: "Cumin (Jeera)", benefit: "Aids digestion, detoxifies, cools Pitta", dosha: "All", emoji: "🌱" },
  { name: "Holy Basil (Tulsi)", benefit: "Respiratory support, natural immunity booster", dosha: "Vata & Kapha", emoji: "🍃" },
];

const FOODS_BY_DOSHA = [
  { dosha: "Vata", icon: Wind, color: "text-sky-600", bgColor: "from-sky-500/10 to-blue-500/10", favor: ["Warm soups & stews", "Cooked grains (rice, oats)", "Sweet fruits (bananas, mangos)", "Root vegetables", "Warm milk with spices"], avoid: ["Raw salads", "Cold drinks", "Dry crackers", "Caffeine"] },
  { dosha: "Pitta", icon: Flame, color: "text-orange-600", bgColor: "from-orange-500/10 to-red-500/10", favor: ["Cooling foods (cucumber, melon)", "Sweet fruits (grapes, pears)", "Green vegetables", "Coconut & mint", "Basmati rice"], avoid: ["Spicy food", "Sour fruits", "Fried food", "Red meat"] },
  { dosha: "Kapha", icon: Droplets, color: "text-green-600", bgColor: "from-green-500/10 to-teal-500/10", favor: ["Light, warm foods", "Spicy dishes", "Leafy greens", "Legumes & beans", "Honey (in moderation)"], avoid: ["Heavy dairy", "Fried foods", "Sweets", "Cold desserts"] },
];

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
      <div className="space-y-6">
        <Card className="border-primary/50 glass-effect relative overflow-hidden">
          <div className="absolute inset-0 gradient-bg opacity-50" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl">🍽️ Personalized Diet Plan</CardTitle>
            <CardDescription>
              Complete your health assessment to receive a diet plan tailored to your dosha type
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <Link to="/assessment">
              <Button size="lg" className="shadow-lg">
                Start Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Ayurvedic Superfoods */}
        <div>
          <h2 className="text-xl font-semibold mb-4">🌿 Ayurvedic Superfoods You Should Know</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AYURVEDIC_FOODS.map((food) => (
              <Card key={food.name} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 glass-effect border-primary/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{food.emoji}</span>
                    <CardTitle className="text-base">{food.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="w-fit text-xs">{food.dosha} Doshas</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{food.benefit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Foods by Dosha */}
        <div>
          <h2 className="text-xl font-semibold mb-4">🔥 Foods For Your Dosha</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {FOODS_BY_DOSHA.map((item) => (
              <Card key={item.dosha} className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${item.bgColor}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <CardTitle className={`text-lg ${item.color}`}>{item.dosha}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-1">✅ Favor</p>
                    <ul className="text-sm text-muted-foreground space-y-0.5">
                      {item.favor.map((f, i) => <li key={i}>• {f}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">❌ Avoid</p>
                    <ul className="text-sm text-muted-foreground space-y-0.5">
                      {item.avoid.map((a, i) => <li key={i}>• {a}</li>)}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Ayurvedic Diet Principles */}
        <Card className="glass-effect border-primary/20">
          <CardHeader>
            <CardTitle>📖 6 Golden Rules of Ayurvedic Eating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { title: "Eat your largest meal at noon", desc: "When the sun is highest, your digestive fire (Agni) is strongest" },
                { title: "Include all 6 tastes", desc: "Sweet, sour, salty, bitter, pungent, and astringent in every meal" },
                { title: "Drink warm water", desc: "Sip warm or room-temperature water throughout the day" },
                { title: "Eat mindfully", desc: "No screens or distractions — chew thoroughly and eat slowly" },
                { title: "Wait 3 hours between meals", desc: "Allow your previous meal to fully digest before eating again" },
                { title: "Eat seasonal foods", desc: "Nature provides exactly what your body needs each season" },
              ].map((rule, i) => (
                <div key={i} className="p-3 rounded-lg border hover:shadow-sm transition-shadow">
                  <p className="font-medium text-sm">{rule.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{rule.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <RemAide context="diet" />
      </div>
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
      <RemAide context="diet" />
    </div>
  );
}
