import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import type { DoshaType } from '@/types';

export default function AssessmentPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [digestion, setDigestion] = useState('');
  const [sleep, setSleep] = useState('');
  const [energy, setEnergy] = useState('');
  const [stress, setStress] = useState('');
  const [skin, setSkin] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [appetite, setAppetite] = useState('');

  const symptomOptions = [
    'Dry skin', 'Anxiety', 'Constipation', 'Joint pain', 'Insomnia',
    'Heartburn', 'Inflammation', 'Excessive heat', 'Skin rashes', 'Irritability',
    'Congestion', 'Weight gain', 'Lethargy', 'Slow digestion', 'Water retention',
  ];

  const calculateDosha = (): { primary: DoshaType; secondary: DoshaType; severity: string } => {
    const scores = { vata: 0, pitta: 0, kapha: 0 };

    if (symptoms.includes('Dry skin') || symptoms.includes('Anxiety') || symptoms.includes('Constipation') || symptoms.includes('Insomnia')) {
      scores.vata += 2;
    }
    if (symptoms.includes('Heartburn') || symptoms.includes('Inflammation') || symptoms.includes('Skin rashes') || symptoms.includes('Irritability')) {
      scores.pitta += 2;
    }
    if (symptoms.includes('Congestion') || symptoms.includes('Weight gain') || symptoms.includes('Lethargy') || symptoms.includes('Slow digestion')) {
      scores.kapha += 2;
    }

    if (digestion === 'irregular') scores.vata += 1;
    if (digestion === 'strong') scores.pitta += 1;
    if (digestion === 'slow') scores.kapha += 1;

    if (sleep === 'light') scores.vata += 1;
    if (sleep === 'moderate') scores.pitta += 1;
    if (sleep === 'heavy') scores.kapha += 1;

    if (energy === 'variable') scores.vata += 1;
    if (energy === 'intense') scores.pitta += 1;
    if (energy === 'steady') scores.kapha += 1;

    if (bodyType === 'thin') scores.vata += 1;
    if (bodyType === 'medium') scores.pitta += 1;
    if (bodyType === 'heavy') scores.kapha += 1;

    const sortedDoshas = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary = sortedDoshas[0][0] as DoshaType;
    const secondary = sortedDoshas[1][0] as DoshaType;
    
    const totalScore = sortedDoshas[0][1];
    const severity = totalScore >= 6 ? 'high' : totalScore >= 4 ? 'moderate' : 'mild';

    return { primary, secondary, severity };
  };

  const handleSubmit = async () => {
    if (!profile?.id) {
      toast.error('Please log in to submit assessment');
      return;
    }

    setLoading(true);

    try {
      const doshaResults = calculateDosha();

      const assessment = await api.assessments.create({
        user_id: profile.id,
        symptoms,
        daily_habits: { digestion, sleep, energy, stress },
        physical_attributes: { skin, body_type: bodyType, appetite },
        mental_patterns: { stress_level: stress },
        dosha_results: doshaResults,
        primary_dosha: doshaResults.primary,
        secondary_dosha: doshaResults.secondary,
        imbalance_severity: doshaResults.severity,
        status: 'completed',
      });

      toast.success('Assessment completed successfully!');
      navigate(`/assessment/${assessment.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit assessment');
    } finally {
      setLoading(false);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="relative overflow-hidden glass-effect border-primary/20">
        <div className="absolute inset-0 opacity-5">
          <img 
            src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_729a0452-f37d-4c42-afce-ab675f5d33e5.jpg" 
            alt="Traditional Ayurvedic medicine background"
            className="w-full h-full object-cover"
          />
        </div>
        <CardHeader className="relative z-10">
          <CardTitle>Health Assessment</CardTitle>
          <CardDescription>
            Answer these questions to identify your dosha imbalances
          </CardDescription>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-lg mb-3 block">Select any symptoms you're experiencing:</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  {symptomOptions.map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom}
                        checked={symptoms.includes(symptom)}
                        onCheckedChange={() => toggleSymptom(symptom)}
                      />
                      <label htmlFor={symptom} className="text-sm cursor-pointer">
                        {symptom}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-lg">How is your digestion?</Label>
                <RadioGroup value={digestion} onValueChange={setDigestion}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="irregular" id="dig-irregular" />
                    <Label htmlFor="dig-irregular" className="cursor-pointer">Irregular or variable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="strong" id="dig-strong" />
                    <Label htmlFor="dig-strong" className="cursor-pointer">Strong and fast</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="slow" id="dig-slow" />
                    <Label htmlFor="dig-slow" className="cursor-pointer">Slow and steady</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-lg">How is your sleep?</Label>
                <RadioGroup value={sleep} onValueChange={setSleep}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="sleep-light" />
                    <Label htmlFor="sleep-light" className="cursor-pointer">Light and easily disturbed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="sleep-moderate" />
                    <Label htmlFor="sleep-moderate" className="cursor-pointer">Moderate, wake up occasionally</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="heavy" id="sleep-heavy" />
                    <Label htmlFor="sleep-heavy" className="cursor-pointer">Deep and heavy</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-lg">How is your energy level?</Label>
                <RadioGroup value={energy} onValueChange={setEnergy}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="variable" id="energy-variable" />
                    <Label htmlFor="energy-variable" className="cursor-pointer">Variable, comes in bursts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intense" id="energy-intense" />
                    <Label htmlFor="energy-intense" className="cursor-pointer">Intense and focused</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="steady" id="energy-steady" />
                    <Label htmlFor="energy-steady" className="cursor-pointer">Steady and enduring</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-lg">What is your body type?</Label>
                <RadioGroup value={bodyType} onValueChange={setBodyType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="thin" id="body-thin" />
                    <Label htmlFor="body-thin" className="cursor-pointer">Thin, hard to gain weight</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="body-medium" />
                    <Label htmlFor="body-medium" className="cursor-pointer">Medium, athletic build</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="heavy" id="body-heavy" />
                    <Label htmlFor="body-heavy" className="cursor-pointer">Heavy, easy to gain weight</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-lg">How is your appetite?</Label>
                <RadioGroup value={appetite} onValueChange={setAppetite}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="variable" id="app-variable" />
                    <Label htmlFor="app-variable" className="cursor-pointer">Variable, sometimes hungry</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="strong" id="app-strong" />
                    <Label htmlFor="app-strong" className="cursor-pointer">Strong, get irritable when hungry</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="steady" id="app-steady" />
                    <Label htmlFor="app-steady" className="cursor-pointer">Steady, can skip meals easily</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-lg">What is your stress level?</Label>
                <RadioGroup value={stress} onValueChange={setStress}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="stress-low" />
                    <Label htmlFor="stress-low" className="cursor-pointer">Low, generally calm</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="stress-moderate" />
                    <Label htmlFor="stress-moderate" className="cursor-pointer">Moderate, manageable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="stress-high" />
                    <Label htmlFor="stress-high" className="cursor-pointer">High, often overwhelmed</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} className="ml-auto">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="ml-auto">
                {loading ? 'Submitting...' : 'Complete Assessment'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
