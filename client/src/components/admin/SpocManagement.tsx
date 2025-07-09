
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Mail, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SpocManagement = () => {
  const { assignSpoc, getAssignedSpocs } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subjects: [] as string[]
  });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Biology'];
  const assignedSpocs = getAssignedSpocs();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleAssignSpoc = async () => {
    if (!formData.name || !formData.email || !formData.password || formData.subjects.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill all fields and select at least one subject",
        variant: "destructive"
      });
      return;
    }

    const success = await assignSpoc(formData);
    if (success) {
      toast({
        title: "SPOC assigned successfully!",
        description: `${formData.name} has been assigned as SPOC for ${formData.subjects.join(', ')}`,
      });
      setFormData({ name: '', email: '', password: '', subjects: [] });
      setIsDialogOpen(false);
    } else {
      toast({
        title: "Failed to assign SPOC",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              SPOC Management
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign New SPOC
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Assign New SPOC</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="spocName">Full Name</Label>
                    <Input
                      id="spocName"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter SPOC name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="spocEmail">Email Address</Label>
                    <Input
                      id="spocEmail"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="spocPassword">Password</Label>
                    <Input
                      id="spocPassword"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create password for SPOC"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Assign Subjects</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {subjects.map((subject) => (
                        <Button
                          key={subject}
                          variant={formData.subjects.includes(subject) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSubjectToggle(subject)}
                          className="justify-start"
                        >
                          {subject}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAssignSpoc} className="w-full">
                    Assign SPOC
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {assignedSpocs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No SPOCs assigned yet</p>
              <p className="text-sm">Click "Assign New SPOC" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedSpocs.map((spoc) => (
                <div key={spoc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{spoc.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="h-3 w-3" />
                        {spoc.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <div className="flex gap-1">
                      {spoc.subjects?.map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpocManagement;
