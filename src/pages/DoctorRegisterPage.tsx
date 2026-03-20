import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Leaf } from 'lucide-react';

export default function DoctorRegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [credentialsFile, setCredentialsFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCredentialsFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: signUpError } = await signUpWithEmail(email, password);
      if (signUpError) {
        toast.error(signUpError.message);
        setLoading(false);
        return;
      }

      // After signup, we log in automatically or user logs in.
      // But for this simple app, we can just assume signup worked.
      // We need the user ID. Our local AuthProvider should have set it or return it.
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
          toast.error('Signup successful. Please login to complete profile.');
          navigate('/login');
          return;
      }
      const user = JSON.parse(storedUser);

      await api.profiles.update(user.id, {
        full_name: fullName,
        role: 'doctor',
      });

      let credentialsUrl = '';
      if (credentialsFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', credentialsFile);
        
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${baseUrl}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          credentialsUrl = data.url;
        }
        setUploading(false);
      }

      await api.doctorProfiles.create({
        id: user.id,
        user_id: user.id,
        registration_number: registrationNumber,
        credentials_url: credentialsUrl,
        specialization,
        experience_years: Number.parseInt(experienceYears),
      });

      toast.success('Registration submitted! Please wait for admin approval.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-40" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-2xl relative z-10 glass-effect border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full gradient-bg flex items-center justify-center shadow-lg">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Doctor Registration</CardTitle>
          <CardDescription>Join our network of verified Ayurvedic practitioners</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Dr. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  placeholder="REG123456"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  placeholder="e.g., Panchakarma, Herbal Medicine"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceYears">Years of Experience</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  placeholder="5"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentials">Upload Credentials (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="credentials"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {credentialsFile && (
                  <span className="text-sm text-muted-foreground">{credentialsFile.name}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload your medical license or certification (Max 1MB)
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading || uploading}>
              {loading || uploading ? 'Registering...' : 'Register as Doctor'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <div className="text-sm text-center text-muted-foreground">
            Already registered?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
