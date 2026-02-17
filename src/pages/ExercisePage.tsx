import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dumbbell, Wind, Sun } from 'lucide-react';
import { toast } from 'sonner';
import type { ExercisePlan, HabitTracking } from '@/types';

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
          api.habitTracking.getRecentByType(profile.id, 'exercise', 1),
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
      const habits = await api.habitTracking.getRecentByType(profile.id, 'exercise', 1);
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
      <Card>
        <CardHeader>
          <CardTitle>No Exercise Plan Yet</CardTitle>
          <CardDescription>
            Complete your health assessment to receive a personalized exercise and dinacharya plan
          </CardDescription>
        </CardHeader>
      </Card>
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
    </div>
  );
}
