import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dumbbell, Wind, Sun, ArrowRight, Clock, Heart, Brain, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { ExercisePlan, HabitTracking } from '@/types';
import RemAide from '@/components/common/RemAide';

const STARTER_YOGA_POSES = [
  { name: "Tadasana (Mountain Pose)", duration: "1 min", benefit: "Improves posture and body awareness", difficulty: "Beginner" },
  { name: "Vrksasana (Tree Pose)", duration: "30 sec each side", benefit: "Balance, focus, and grounding for Vata", difficulty: "Beginner" },
  { name: "Adho Mukha Svanasana (Downward Dog)", duration: "1 min", benefit: "Full body stretch, energizes and calms the mind", difficulty: "Beginner" },
  { name: "Bhujangasana (Cobra Pose)", duration: "30 sec", benefit: "Opens chest, strengthens back, stimulates digestion", difficulty: "Beginner" },
  { name: "Balasana (Child's Pose)", duration: "1-2 min", benefit: "Deep relaxation, calms the nervous system", difficulty: "Beginner" },
  { name: "Surya Namaskar (Sun Salutation)", duration: "5-10 min", benefit: "Complete body workout, energizes all doshas", difficulty: "Intermediate" },
];

const PRANAYAMA_GUIDE = [
  { name: "Nadi Shodhana", aka: "Alternate Nostril Breathing", time: "5 min", benefit: "Balances both brain hemispheres, reduces stress and anxiety", suitable: "All Doshas", icon: Wind },
  { name: "Bhramari", aka: "Bee Breath", time: "3 min", benefit: "Calms the mind, relieves tension, improves concentration", suitable: "Vata & Pitta", icon: Heart },
  { name: "Kapalabhati", aka: "Skull Shining Breath", time: "3 min", benefit: "Energizes the body, cleanses lungs, boosts metabolism", suitable: "Kapha", icon: Flame },
  { name: "Ujjayi", aka: "Ocean Breath", time: "5 min", benefit: "Builds internal heat, calms the mind, improves focus", suitable: "All Doshas", icon: Brain },
];

const DINACHARYA_ROUTINE = [
  { time: "5:30 AM", activity: "Wake up before sunrise", icon: "🌅" },
  { time: "5:45 AM", activity: "Oil pulling with sesame/coconut oil (5 min)", icon: "🪥" },
  { time: "6:00 AM", activity: "Tongue scraping + warm lemon water", icon: "💧" },
  { time: "6:15 AM", activity: "Abhyanga (warm oil self-massage)", icon: "💆" },
  { time: "6:30 AM", activity: "Yoga asanas (20 min)", icon: "🧘" },
  { time: "7:00 AM", activity: "Pranayama + Meditation (15 min)", icon: "🌬️" },
  { time: "7:30 AM", activity: "Light, warm breakfast", icon: "🍳" },
  { time: "12:30 PM", activity: "Main meal of the day (lunch)", icon: "🍽️" },
  { time: "6:30 PM", activity: "Light dinner before sunset", icon: "🥗" },
  { time: "9:00 PM", activity: "Warm milk with nutmeg", icon: "🥛" },
  { time: "10:00 PM", activity: "Sleep during Kapha time", icon: "😴" },
];

export default function ExercisePage() {
  const { profile } = useAuth();
  const [exercisePlan, setExercisePlan] = useState<ExercisePlan | null>(null);
  const [todayHabits, setTodayHabits] = useState<HabitTracking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!profile?.id) return;

      try {
        const [plan, habits] = await Promise.all([
          api.exercisePlans.getActiveByUser(profile.id),
          api.habitTracking.getRecentByType(profile.id, 'exercise'),
        ]);
        setExercisePlan(plan);
        setTodayHabits(habits);
      } catch (error) {
        console.error('Failed to load exercise plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profile?.id]);

  const markComplete = async (habitName: string) => {
    if (!profile?.id) return;

    try {
      await api.habitTracking.create({
        user_id: profile.id,
        habit_type: 'exercise',
        habit_name: habitName,
      });
      toast.success(`${habitName} marked as complete!`);
      const habits = await api.habitTracking.getRecentByType(profile.id, 'exercise');
      setTodayHabits(habits);
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark habit');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full bg-muted" />
        <Skeleton className="h-64 w-full bg-muted" />
      </div>
    );
  }

  if (!exercisePlan) {
    return (
      <div className="space-y-6">
        <Card className="border-primary/50 glass-effect relative overflow-hidden">
          <div className="absolute inset-0 gradient-bg opacity-50" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl">🧘 Exercise & Dinacharya</CardTitle>
            <CardDescription>
              Complete your health assessment to receive a personalized exercise and daily routine plan. In the meantime, explore these Ayurvedic wellness practices!
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

        {/* Dinacharya (Daily Routine) */}
        <Card className="glass-effect border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-500" />
              <CardTitle>Dinacharya — Ideal Daily Routine</CardTitle>
            </div>
            <CardDescription>The Ayurvedic blueprint for a balanced day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-secondary/40 to-primary/40" />
              <div className="space-y-3">
                {DINACHARYA_ROUTINE.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 pl-2">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center z-10 flex-shrink-0 text-lg">
                      {item.icon}
                    </div>
                    <div className="flex-1 p-3 rounded-lg border hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">
                          <Clock className="h-3 w-3 mr-1" />{item.time}
                        </Badge>
                        <span className="text-sm font-medium">{item.activity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beginner Yoga Poses */}
        <div>
          <h2 className="text-xl font-semibold mb-4">🧘 Beginner Yoga Poses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STARTER_YOGA_POSES.map((pose) => (
              <Card key={pose.name} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 glass-effect border-primary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{pose.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">{pose.duration}</Badge>
                    <Badge variant="outline" className="text-xs">{pose.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{pose.benefit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pranayama Guide */}
        <div>
          <h2 className="text-xl font-semibold mb-4">🌬️ Pranayama (Breathing Exercises)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PRANAYAMA_GUIDE.map((exercise) => (
              <Card key={exercise.name} className="hover:shadow-lg transition-all duration-300 glass-effect border-primary/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center shadow-sm">
                      <exercise.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{exercise.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{exercise.aka}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{exercise.time}</Badge>
                    <Badge variant="outline" className="text-xs">{exercise.suitable}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{exercise.benefit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <RemAide context="exercise" />
      </div>
    );
  }

  const isCompleted = (habitName: string) => {
    return todayHabits.some(h => h.habit_name === habitName);
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden glass-effect border-primary/20">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_c464fbba-548d-4246-92d8-959df7e534bf.jpg" 
            alt="Yoga meditation background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-20" />
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shadow-lg">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{exercisePlan.title}</CardTitle>
              <CardDescription className="text-base">
                {exercisePlan.description || 'Your personalized wellness routine'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {exercisePlan.duration_minutes && (
          <CardContent className="relative z-10">
            <Badge variant="secondary" className="shadow-sm">
              {exercisePlan.duration_minutes} minutes daily
            </Badge>
          </CardContent>
        )}
      </Card>

      {exercisePlan.daily_routine && Object.keys(exercisePlan.daily_routine).length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              <CardTitle>Daily Dinacharya (Routine)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(exercisePlan.daily_routine).map(([time, activity]) => (
              <div key={time} className="flex items-start justify-between gap-4 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium capitalize">{time}</p>
                  <p className="text-sm text-muted-foreground">{activity as string}</p>
                </div>
                <Button
                  size="sm"
                  variant={isCompleted(`${time}-routine`) ? 'secondary' : 'outline'}
                  onClick={() => markComplete(`${time}-routine`)}
                  disabled={isCompleted(`${time}-routine`)}
                >
                  {isCompleted(`${time}-routine`) ? '✓ Done' : 'Mark Done'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {exercisePlan.yoga_poses && exercisePlan.yoga_poses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <CardTitle>Yoga Asanas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {exercisePlan.yoga_poses.map((pose: any, index: number) => (
              <div key={index} className="flex items-start justify-between gap-4 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{pose.name || pose}</p>
                  {pose.duration && (
                    <p className="text-sm text-muted-foreground">{pose.duration}</p>
                  )}
                  {pose.benefits && (
                    <p className="text-sm text-muted-foreground mt-1">{pose.benefits}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={isCompleted(`yoga-${pose.name || pose}`) ? 'secondary' : 'outline'}
                  onClick={() => markComplete(`yoga-${pose.name || pose}`)}
                  disabled={isCompleted(`yoga-${pose.name || pose}`)}
                >
                  {isCompleted(`yoga-${pose.name || pose}`) ? '✓ Done' : 'Mark Done'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {exercisePlan.pranayama_exercises && exercisePlan.pranayama_exercises.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-primary" />
              <CardTitle>Pranayama (Breathing Exercises)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {exercisePlan.pranayama_exercises.map((exercise: any, index: number) => (
              <div key={index} className="flex items-start justify-between gap-4 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{exercise.name || exercise}</p>
                  {exercise.duration && (
                    <p className="text-sm text-muted-foreground">{exercise.duration}</p>
                  )}
                  {exercise.instructions && (
                    <p className="text-sm text-muted-foreground mt-1">{exercise.instructions}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={isCompleted(`pranayama-${exercise.name || exercise}`) ? 'secondary' : 'outline'}
                  onClick={() => markComplete(`pranayama-${exercise.name || exercise}`)}
                  disabled={isCompleted(`pranayama-${exercise.name || exercise}`)}
                >
                  {isCompleted(`pranayama-${exercise.name || exercise}`) ? '✓ Done' : 'Mark Done'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <RemAide context="exercise" />
    </div>
  );
}
