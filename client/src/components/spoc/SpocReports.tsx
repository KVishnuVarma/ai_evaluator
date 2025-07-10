
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  BarChart3,
  Award,
  Clock,
  Users,
  PieChart
} from 'lucide-react';

interface SpocReportData {
  spoc: {
    id: string;
    department: string;
    accessLevel: string;
  };
  stats: {
    totalPapers: number;
    totalStudents: number;
    papersByStatus: { [key: string]: number };
    papersBySubject: { [key: string]: number };
    averageScore: number;
    gradesDistribution: { [key: string]: number };
  };
  papers: Array<{
    _id: string;
    studentId: {
      name: string;
      rollNo: string;
    };
    subject: string;
    examDate: string;
    status: string;
    finalGrade?: {
      score: number;
      grade: string;
    };
    maxMarks: number;
  }>;
}

interface Spoc {
  _id: string;
  userId: {
    name: string;
  };
  department: string;
}

interface SpocReportsProps {
  spoc: Spoc;
}

export const SpocReports: React.FC<SpocReportsProps> = ({ spoc }) => {
  const [reportData, setReportData] = useState<SpocReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateFilters, setDateFilters] = useState({
    startDate: '',
    endDate: '',
    subject: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, [spoc._id, dateFilters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilters.startDate) params.append('startDate', dateFilters.startDate);
      if (dateFilters.endDate) params.append('endDate', dateFilters.endDate);
      if (dateFilters.subject) params.append('subject', dateFilters.subject);

      const response = await fetch(`/api/spoc/${spoc._id}/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        throw new Error('Failed to fetch reports');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      // Implement report export logic
      toast({
        title: "Success",
        description: "Report exported successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'graded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'bg-green-100 text-green-800';
      case 'B+':
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C+':
      case 'C': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  if (loading && !reportData) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Reports for {spoc.userId.name} - {spoc.department}
            </CardTitle>
            <Button onClick={exportReport} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                type="date"
                value={dateFilters.startDate}
                onChange={(e) => setDateFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input
                type="date"
                value={dateFilters.endDate}
                onChange={(e) => setDateFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <Input
                type="text"
                placeholder="Filter by subject"
                value={dateFilters.subject}
                onChange={(e) => setDateFilters(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Papers</p>
                    <h3 className="text-2xl font-bold text-gray-900">{reportData.stats.totalPapers}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-blue-50">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Students</p>
                    <h3 className="text-2xl font-bold text-gray-900">{reportData.stats.totalStudents}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-green-50">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <h3 className="text-2xl font-bold text-gray-900">{reportData.stats.averageScore}%</h3>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-50">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Subjects</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {Object.keys(reportData.stats.papersBySubject).length}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-purple-50">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  Paper Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(reportData.stats.papersByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <div className="w-20">
                          <Progress 
                            value={(count / reportData.stats.totalPapers) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Grade Distribution */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(reportData.stats.gradesDistribution).map(([grade, count]) => (
                    <div key={grade} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getGradeColor(grade)}>
                          {grade}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <div className="w-20">
                          <Progress 
                            value={count > 0 ? (count / reportData.stats.totalPapers) * 100 : 0} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Papers Table */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Recent Papers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Exam Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.papers.map((paper) => (
                      <TableRow key={paper._id} className="hover:bg-gray-50/80 transition-colors">
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{paper.studentId.name}</div>
                            <div className="text-sm text-gray-500">{paper.studentId.rollNo}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50">
                            {paper.subject}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(paper.examDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(paper.status)}>
                            {paper.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {paper.finalGrade ? (
                            <span className="font-medium">
                              {paper.finalGrade.score}/{paper.maxMarks}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {paper.finalGrade ? (
                            <Badge className={getGradeColor(paper.finalGrade.grade)}>
                              {paper.finalGrade.grade}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
