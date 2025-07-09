import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, TrendingUp, Star, HelpCircle, BookOpen, Target, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchStudentResults } from '@/lib/api';

interface StudentResult {
  id: string;
  subject: string;
  examTitle: string;
  score: number;
  totalMarks: number;
  grade: string;
  date: string;
  feedback: string;
  aiSuggestions: string[];
}

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingResults(true);
    fetchStudentResults(user.id)
      .then((data) => {
        setResults(data.results || []);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to load results');
        setResults([]);
      })
      .finally(() => setLoadingResults(false));
  }, [user?.id]);

  // Calculate subject stats from results
  const subjectStats = React.useMemo(() => {
    const stats: { [subject: string]: { total: number; count: number } } = {};
    results.forEach((r) => {
      if (!stats[r.subject]) stats[r.subject] = { total: 0, count: 0 };
      stats[r.subject].total += r.score;
      stats[r.subject].count += 1;
    });
    return Object.entries(stats).map(([subject, { total, count }]) => ({
      subject,
      average: Math.round(total / count),
      trend: 'neutral',
      color: 'bg-blue-500',
    }));
  }, [results]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
  };

  const handleRaiseTicket = () => {
    if (!ticketTitle || !ticketDescription) {
      toast({
        title: "Please fill all fields",
        description: "Both title and description are required",
        variant: "destructive"
      });
      return;
    }

    // Simulate ticket creation
    toast({
      title: "Ticket raised successfully!",
      description: "Your query has been sent to the SPOC. You'll receive a response soon.",
    });

    setTicketTitle('');
    setTicketDescription('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingUp className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome, {user?.name}
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>Roll No: {user?.rollNo}</span>
              <span>•</span>
              <span>Section: {user?.section}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {subjectStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-700">{stat.subject}</h3>
                  {getTrendIcon(stat.trend)}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.average}%</p>
                    <p className="text-sm text-gray-500">Average Score</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="results" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border">
            <TabsTrigger value="results" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              My Results
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Raise Ticket
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results">
            <div className="space-y-4">
              {loadingResults ? (
                <div>Loading results...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : results.length === 0 ? (
                <div>No results found.</div>
              ) : (
                results.map((result) => (
                  <Card key={result.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{result.subject}</h3>
                            <Badge className="bg-blue-100 text-blue-800">{result.examTitle}</Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{result.date}</p>
                          <p className="text-sm text-gray-700">{result.feedback}</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                              {result.score}/{result.totalMarks}
                            </div>
                            <div className="text-lg font-medium text-gray-700">Grade: {result.grade}</div>
                          </div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Star className="h-4 w-4 mr-2" />
                                AI Suggestions
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>AI Performance Suggestions</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Subject: {result.subject}</h4>
                                  <p className="text-sm text-gray-600 mb-4">{result.feedback}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Personalized Recommendations:</h4>
                                  <ul className="space-y-2">
                                    {result.aiSuggestions.map((suggestion, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-sm text-gray-700">{suggestion}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {subjectStats.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{subject.subject}</span>
                      <span className="text-sm text-gray-600">{subject.average}%</span>
                    </div>
                    <Progress value={subject.average} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-500" />
                  Raise a Support Ticket
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ticketTitle">Subject/Title</Label>
                  <Input
                    id="ticketTitle"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    placeholder="Brief description of your query"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ticketDescription">Detailed Description</Label>
                  <Textarea
                    id="ticketDescription"
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Explain your query in detail..."
                    className="mt-1 min-h-32"
                  />
                </div>
                <Button onClick={handleRaiseTicket} className="w-full bg-gradient-to-r from-blue-600 to-blue-700">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Submit Ticket
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
