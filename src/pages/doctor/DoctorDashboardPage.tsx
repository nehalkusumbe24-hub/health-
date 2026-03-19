import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Activity, FileText, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { Assessment } from '@/types';
import RemAide from '@/components/common/RemAide';

export default function DoctorDashboardPage() {
  const { profile } = useAuth();
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const assessments = await api.assessments.listAll(10);
        setRecentAssessments(assessments);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Patients', value: recentAssessments.length, icon: Users, color: 'text-primary' },
    { label: 'Pending Reviews', value: recentAssessments.filter(a => a.status === 'pending').length, icon: Activity, color: 'text-secondary' },
    { label: 'Prescriptions', value: 0, icon: FileText, color: 'text-primary' },
    { label: 'Messages', value: 0, icon: MessageSquare, color: 'text-secondary' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
        <p className="text-muted-foreground">Welcome, Dr. {profile?.full_name}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
          <CardDescription>Latest patient health assessments requiring review</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAssessments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No assessments yet</p>
          ) : (
            <div className="space-y-3">
              {recentAssessments.slice(0, 5).map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{assessment.user?.full_name || assessment.user?.email || 'Patient'}</p>
                    <p className="text-sm text-muted-foreground">
                      {assessment.primary_dosha && `Primary: ${assessment.primary_dosha}`}
                      {assessment.imbalance_severity && ` • Severity: ${assessment.imbalance_severity}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link to={`/doctor/assessments/${assessment.id}`}>
                    <Button variant="outline" size="sm">Review</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <RemAide context="doctor" />
    </div>
  );
}
