
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, CheckCircle, X, User, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AttendanceSystem = () => {
  const [rollNo, setRollNo] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const mockStudentData = {
    '21CS001': { name: 'John Doe', section: 'A', registeredPhoto: '/placeholder.svg' },
    '21CS002': { name: 'Jane Smith', section: 'B', registeredPhoto: '/placeholder.svg' },
    '21CS003': { name: 'Mike Johnson', section: 'A', registeredPhoto: '/placeholder.svg' }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processAttendance = async () => {
    if (!rollNo || !capturedPhoto) {
      toast({
        title: "Missing information",
        description: "Please enter roll number and upload photo",
        variant: "destructive"
      });
      return;
    }

    const student = mockStudentData[rollNo as keyof typeof mockStudentData];
    if (!student) {
      toast({
        title: "Student not found",
        description: "Invalid roll number",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate AI face recognition processing
    setTimeout(() => {
      // Mock AI decision - 90% success rate
      const isMatch = Math.random() > 0.1;
      
      if (isMatch) {
        setAttendanceStatus('success');
        toast({
          title: "Attendance marked successfully!",
          description: `Welcome ${student.name}! Your attendance has been recorded.`,
        });
      } else {
        setAttendanceStatus('failed');
        toast({
          title: "Face verification failed",
          description: "The uploaded photo doesn't match registered records",
          variant: "destructive"
        });
      }
      setIsProcessing(false);
    }, 3000);
  };

  const resetForm = () => {
    setRollNo('');
    setCapturedPhoto(null);
    setAttendanceStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const todayAttendance = [
    { rollNo: '21CS001', name: 'John Doe', time: '09:15 AM', status: 'present' },
    { rollNo: '21CS003', name: 'Mike Johnson', time: '09:18 AM', status: 'present' },
    { rollNo: '21CS002', name: 'Jane Smith', time: '09:22 AM', status: 'present' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Marking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-500" />
              Mark Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="rollNumber">Student Roll Number</Label>
              <Input
                id="rollNumber"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="Enter roll number (e.g., 21CS001)"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Upload Current Photo</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload photo</p>
                </label>
              </div>
              
              {capturedPhoto && (
                <div className="mt-3">
                  <img
                    src={capturedPhoto}
                    alt="Captured"
                    className="w-32 h-32 object-cover rounded-lg mx-auto border-2 border-gray-200"
                  />
                </div>
              )}
            </div>

            {isProcessing && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-blue-700 font-medium">AI is verifying face...</p>
                <p className="text-sm text-blue-600">Comparing with registered photo</p>
              </div>
            )}

            {attendanceStatus === 'success' && (
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-medium">Attendance Marked Successfully!</p>
                <p className="text-sm text-green-600">Face verified and recorded</p>
              </div>
            )}

            {attendanceStatus === 'failed' && (
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <X className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-red-700 font-medium">Face Verification Failed</p>
                <p className="text-sm text-red-600">Please try again with a clear photo</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={processAttendance}
                disabled={isProcessing || !rollNo || !capturedPhoto}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Mark Attendance'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAttendance.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{record.name}</p>
                      <p className="text-sm text-gray-500">Roll: {record.rollNo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-500 mb-1">Present</Badge>
                    <p className="text-xs text-gray-500">{record.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceSystem;
