import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Clock, AlertCircle, Eye, Users, Calendar, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import LiveAttendanceSystem from '@/components/attendance/LiveAttendanceSystem';

const SpocDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [selectedResult, setSelectedResult] = useState<any>(null);

  const pendingResults = [
    {
      id: 1,
      studentName: 'John Doe',
      rollNo: '21CS001',
      subject: 'Mathematics',
      examTitle: 'Mid-term Exam',
      aiScore: 85,
      totalMarks: 100,
      submittedBy: 'Admin Teacher',
      submittedAt: '2024-01-15 10:30 AM',
      aiAnalysis: 'Strong understanding of algebraic concepts. Minor calculation errors noted.',
      status: 'pending_review'
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      rollNo: '21CS002',
      subject: 'Mathematics',
      examTitle: 'Unit Test',
      aiScore: 78,
      totalMarks: 100,
      submittedBy: 'Admin Teacher',
      submittedAt: '2024-01-15 11:15 AM',
      aiAnalysis: 'Good problem-solving approach. Needs improvement in time management.',
      status: 'pending_review'
    }
  ];

  const approvedResults = [
    {
      id: 3,
      studentName: 'Mike Johnson',
      rollNo: '21CS003',
      subject: 'Mathematics',
      examTitle: 'Weekly Quiz',
      finalScore: 92,
      totalMarks: 100,
      approvedAt: '2024-01-14 02:30 PM',
      spocComments: 'Excellent performance. Keep up the good work.',
      status: 'approved'
    }
  ];

  const tickets = [
    {
      id: 1,
      studentName: 'John Doe',
      rollNo: '21CS001',
      subject: 'Mathematics',
      title: 'Query about marks distribution',
      description: 'I want to understand how marks were distributed for question 3',
      raisedAt: '2024-01-15 03:20 PM',
      status: 'open'
    }
  ];

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
  };

  const handleBulkApprove = async () => {
    toast({
      title: "Bulk approval completed!",
      description: `All ${pendingResults.length} results have been approved and released to students.`,
    });
  };

  const handleBulkReject = async () => {
    toast({
      title: "Results sent back for review",
      description: "All pending results have been sent back to admin for review.",
    });
  };

  const handleApproveResult = async (resultId: number, comments: string = '') => {
    toast({
      title: "Result approved successfully!",
      description: "The result has been released to the student.",
    });
  };

  const handleRejectResult = async (resultId: number, reason: string) => {
    toast({
      title: "Result sent back for review",
      description: "The admin has been notified to review the result.",
    });
  };

  const ResultReviewDialog = ({ result }: { result: any }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Review Result - {result.studentName}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Student</p>
            <p className="font-medium">{result.studentName} ({result.rollNo})</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Subject</p>
            <p className="font-medium">{result.subject}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Exam</p>
            <p className="font-medium">{result.examTitle}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">AI Score</p>
            <p className="font-medium text-blue-600">{result.aiScore}/{result.totalMarks}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">AI Analysis</p>
          <p className="p-3 bg-gray-50 rounded-lg text-sm">{result.aiAnalysis}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">SPOC Comments (Optional)</p>
          <Textarea placeholder="Add your comments about this result..." />
        </div>

        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-green-600" 
            onClick={() => handleApproveResult(result.id)}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve & Release
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-red-200 text-red-600"
            onClick={() => handleRejectResult(result.id, 'Needs review')}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Send Back for Review
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              SPOC Dashboard
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>Welcome, {user?.name}</span>
              <span>•</span>
              <span>Subjects: {user?.subjects?.join(', ')}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="results" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Results
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved Results
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Student Tickets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Results Pending Your Review ({pendingResults.length})
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleBulkApprove}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve All ({pendingResults.length})
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleBulkReject}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      size="sm"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Reject All
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{result.studentName}</h3>
                          <Badge variant="outline">{result.rollNo}</Badge>
                          <Badge className="bg-orange-100 text-orange-800">{result.subject}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{result.examTitle}</p>
                        <p className="text-xs text-gray-500">
                          Submitted by {result.submittedBy} at {result.submittedAt}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {result.aiScore}/{result.totalMarks}
                          </div>
                          <div className="text-xs text-gray-500">AI Score</div>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedResult(result)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <ResultReviewDialog result={result} />
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Approved Results ({approvedResults.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvedResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{result.studentName}</h3>
                          <Badge variant="outline">{result.rollNo}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{result.examTitle}</p>
                        <p className="text-xs text-gray-500">Approved at {result.approvedAt}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {result.finalScore}/{result.totalMarks}
                        </div>
                        <Badge className="bg-green-500 text-xs">Released</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <LiveAttendanceSystem />
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  Student Support Tickets ({tickets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                          <p className="text-sm text-gray-600">
                            {ticket.studentName} ({ticket.rollNo}) - {ticket.subject}
                          </p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Open</Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{ticket.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Raised at {ticket.raisedAt}</p>
                        <Button size="sm">
                          Reply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SpocDashboard;
