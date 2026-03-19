import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserCheck, Activity } from 'lucide-react';
import RemAide from '@/components/common/RemAide';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, doctors: 0, assessments: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [users, doctors, assessments] = await Promise.all([
          api.profiles.list(1000),
          api.doctorProfiles.listApproved(1000),
          api.assessments.listAll(1000),
        ]);

        setStats({
          users: users.length,
          doctors: doctors.length,
          assessments: assessments.length,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        <Skeleton className="h-32 bg-muted" />
        <Skeleton className="h-32 bg-muted" />
        <Skeleton className="h-32 bg-muted" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-primary' },
    { label: 'Approved Doctors', value: stats.doctors, icon: UserCheck, color: 'text-secondary' },
    { label: 'Total Assessments', value: stats.assessments, icon: Activity, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
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
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your Ayurvedic Health Advisor platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <button type="button" onClick={() => navigate('/admin/doctors')} className="block w-full text-left p-4 border rounded-lg hover:bg-accent transition-colors">
              <p className="font-medium">Review Doctor Applications</p>
              <p className="text-sm text-muted-foreground">Approve or reject pending doctor registrations</p>
            </button>
            <button type="button" onClick={() => navigate('/admin/users')} className="block w-full text-left p-4 border rounded-lg hover:bg-accent transition-colors">
              <p className="font-medium">Manage Users</p>
              <p className="text-sm text-muted-foreground">View and manage user accounts</p>
            </button>
          </div>
        </CardContent>
      </Card>
      <RemAide context="admin" />
    </div>
  );
}
