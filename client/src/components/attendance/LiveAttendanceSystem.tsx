
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Camera, MapPin, CheckCircle, X, User, Calendar, Video, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LiveAttendanceSystem = () => {
  const [rollNo, setRollNo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const mockStudentData = {
    '21CS001': { name: 'John Doe', section: 'A', registeredPhoto: '/placeholder.svg' },
    '21CS002': { name: 'Jane Smith', section: 'B', registeredPhoto: '/placeholder.svg' },
    '21CS003': { name: 'Mike Johnson', section: 'A', registeredPhoto: '/placeholder.svg' }
  };

  // Get readable address from coordinates
  const getReadableAddress = async (lat: number, lng: number) => {
    try {
      // Using a mock address for demo - in real app, use reverse geocoding API
      const mockAddresses = [
        "Computer Science Building, Main Campus",
        "Engineering Block A, University",
        "Library Building, Academic Zone"
      ];
      const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
      return randomAddress;
    } catch (error) {
      return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const startCamera = async () => {
    try {
      console.log('Starting camera and location services...');
      
      // Get location first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const address = await getReadableAddress(lat, lng);
            
            setLocation({ lat, lng, address });
            console.log('Location obtained:', { lat, lng, address });
            
            toast({
              title: "Location verified",
              description: `Location: ${address}`,
            });
          },
          (error) => {
            console.error('Location error:', error);
            toast({
              title: "Location access required",
              description: "Please enable location access for attendance marking",
              variant: "destructive"
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      }

      // Start camera with better constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false 
      });
      
      setStream(mediaStream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }

      // Simulate face detection
      setTimeout(() => {
        setFaceDetected(true);
        toast({
          title: "Face detected",
          description: "Please capture your photo when ready",
        });
      }, 2000);

      console.log('Camera started successfully');
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to mark attendance",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
      setFaceDetected(false);
      console.log('Camera stopped');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !faceDetected) {
      toast({
        title: "Cannot capture photo",
        description: faceDetected ? "Camera not ready" : "No face detected",
        variant: "destructive"
      });
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      toast({
        title: "Error",
        description: "Unable to capture photo",
        variant: "destructive"
      });
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(photoDataUrl);
    
    toast({
      title: "Photo captured",
      description: "Photo captured successfully! Ready to mark attendance.",
    });

    console.log('Photo captured successfully');
  };

  const processAttendance = async () => {
    if (!rollNo || !capturedPhoto || !location) {
      toast({
        title: "Missing information",
        description: "Please enter roll number, capture photo, and enable location",
        variant: "destructive"
      });
      return;
    }

    const student = mockStudentData[rollNo as keyof typeof mockStudentData];
    if (!student) {
      toast({
        title: "Student not found",
        description: "Invalid roll number. Please check and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    console.log('Processing attendance for:', student.name);
    
    // Simulate AI face matching with location verification
    setTimeout(() => {
      // 85% success rate for face matching
      const isMatch = Math.random() > 0.15;
      
      if (isMatch) {
        setAttendanceStatus('success');
        toast({
          title: "Attendance marked successfully!",
          description: `Welcome ${student.name}! Your attendance has been recorded.`,
        });
        console.log('Attendance marked successfully for:', student.name);
      } else {
        setAttendanceStatus('failed');
        toast({
          title: "Face verification failed",
          description: "You are not the registered student for this roll number. Please try again.",
          variant: "destructive"
        });
        console.log('Face verification failed for roll number:', rollNo);
      }
      setIsProcessing(false);
    }, 3000);
  };

  const resetForm = () => {
    setRollNo('');
    setCapturedPhoto(null);
    setAttendanceStatus('idle');
    setLocation(null);
    setFaceDetected(false);
    stopCamera();
    console.log('Form reset');
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const todayAttendance = [
    { rollNo: '21CS001', name: 'John Doe', time: '09:15 AM', status: 'present', location: 'Computer Science Building' },
    { rollNo: '21CS003', name: 'Mike Johnson', time: '09:18 AM', status: 'present', location: 'Computer Science Building' },
    { rollNo: '21CS002', name: 'Jane Smith', time: '09:22 AM', status: 'present', location: 'Computer Science Building' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Attendance Marking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-500" />
              Live Attendance System
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
              <Label>Live Camera Feed</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {!isCameraActive ? (
                  <div>
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-3">Click to start camera and location services</p>
                    <Button onClick={startCamera} variant="outline">
                      <Video className="h-4 w-4 mr-2" />
                      Start Camera & Location
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full max-w-sm mx-auto rounded-lg border-2 border-gray-300"
                      />
                      {faceDetected && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                          Face Detected ✓
                        </div>
                      )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-2 justify-center">
                      <Button 
                        onClick={capturePhoto} 
                        disabled={!faceDetected}
                        className="flex-1 max-w-xs"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capture Photo
                      </Button>
                      <Button onClick={stopCamera} variant="outline">
                        <VideoOff className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {capturedPhoto && (
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600 mb-2">Captured Photo:</p>
                  <img
                    src={capturedPhoto}
                    alt="Captured"
                    className="w-24 h-24 object-cover rounded-lg mx-auto border-2 border-green-200"
                  />
                </div>
              )}

              {location && (
                <div className="flex items-center gap-2 text-sm text-green-600 mt-2 p-2 bg-green-50 rounded">
                  <MapPin className="h-4 w-4" />
                  <span>Location: {location.address}</span>
                </div>
              )}
            </div>

            {isProcessing && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-blue-700 font-medium">AI is verifying your face...</p>
                <p className="text-sm text-blue-600">Comparing with registered photo for roll number: {rollNo}</p>
              </div>
            )}

            {attendanceStatus === 'success' && (
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-medium">Attendance Marked Successfully!</p>
                <p className="text-sm text-green-600">Face & location verified ✓</p>
              </div>
            )}

            {attendanceStatus === 'failed' && (
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <X className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-red-700 font-medium">Face Verification Failed</p>
                <p className="text-sm text-red-600">You are not the registered student for this roll number</p>
                <Button 
                  onClick={() => setCapturedPhoto(null)} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={processAttendance}
                disabled={isProcessing || !rollNo || !capturedPhoto || !location}
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
                      <p className="text-xs text-gray-400">{record.location}</p>
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

export default LiveAttendanceSystem;
