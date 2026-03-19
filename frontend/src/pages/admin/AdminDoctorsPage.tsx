import { useEffect, useState } from 'react';
import { api } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';
import type { DoctorProfile } from '@/types';
import RemAide from '@/components/common/RemAide';

export default function AdminDoctorsPage() {
  const { profile } = useAuth();
  const [pendingDoctors, setPendingDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const doctors = await api.doctorProfiles.listPending();
      setPendingDoctors(doctors);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId: string) => {
    if (!profile?.id) return;

    try {
      await api.doctorProfiles.updateStatus(doctorId, 'approved', profile.id);
      await api.profiles.updateRole(doctorId, 'doctor');
      toast.success('Doctor approved successfully');
      loadDoctors();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve doctor');
    }
  };

  const handleReject = async (doctorId: string) => {
    if (!profile?.id) return;

    try {
      await api.doctorProfiles.updateStatus(doctorId, 'rejected', profile.id);
      toast.success('Doctor application rejected');
      loadDoctors();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject doctor');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 bg-muted" />
        <Skeleton className="h-32 bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Doctor Approvals</h1>
        <p className="text-muted-foreground">Review and approve doctor registrations</p>
      </div>

      {pendingDoctors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No pending doctor applications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingDoctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{doctor.profile?.full_name || 'Doctor'}</CardTitle>
                    <CardDescription>{doctor.profile?.email}</CardDescription>
                  </div>
                  <Badge variant="secondary">{doctor.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                    <p className="text-sm">{doctor.registration_number}</p>
                  </div>
                  {doctor.specialization && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                      <p className="text-sm">{doctor.specialization}</p>
                    </div>
                  )}
                  {doctor.experience_years && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Experience</p>
                      <p className="text-sm">{doctor.experience_years} years</p>
                    </div>
                  )}
                  {doctor.credentials_url && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Credentials</p>
                      <a
                        href={doctor.credentials_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(doctor.id)}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(doctor.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <RemAide context="admin" />
    </div>
  );
}
