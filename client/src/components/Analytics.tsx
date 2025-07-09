
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, FileText, Clock, Award, BookOpen } from 'lucide-react';

const Analytics = () => {
  const performanceData = [
    { exam: 'Math Test 1', average: 78, highest: 95, lowest: 45 },
    { exam: 'Physics Quiz', average: 82, highest: 98, lowest: 62 },
    { exam: 'English Essay', average: 75, highest: 92, lowest: 58 },
    { exam: 'Chemistry Lab', average: 85, highest: 96, lowest: 71 },
    { exam: 'History Assignment', average: 79, highest: 94, lowest: 55 }
  ];

  const trendData = [
    { month: 'Jan', avgScore: 72, totalPapers: 120 },
    { month: 'Feb', avgScore: 75, totalPapers: 145 },
    { month: 'Mar', avgScore: 78, totalPapers: 160 },
    { month: 'Apr', avgScore: 81, totalPapers: 185 },
    { month: 'May', avgScore: 83, totalPapers: 200 },
    { month: 'Jun', avgScore: 79, totalPapers: 175 }
  ];

  const gradeDistribution = [
    { grade: 'A+ (90-100)', count: 45, color: '#10B981' },
    { grade: 'A (80-89)', count: 78, color: '#3B82F6' },
    { grade: 'B (70-79)', count: 92, color: '#F59E0B' },
    { grade: 'C (60-69)', count: 56, color: '#EF4444' },
    { grade: 'D (50-59)', count: 23, color: '#8B5CF6' },
    { grade: 'F (0-49)', count: 12, color: '#6B7280' }
  ];

  const subjectPerformance = [
    { subject: 'Mathematics', avgScore: 78, papers: 156, trend: '+5%' },
    { subject: 'Physics', avgScore: 82, papers: 134, trend: '+8%' },
    { subject: 'Chemistry', avgScore: 85, papers: 142, trend: '+3%' },
    { subject: 'English', avgScore: 75, papers: 167, trend: '-2%' },
    { subject: 'History', avgScore: 79, papers: 98, trend: '+7%' },
    { subject: 'Biology', avgScore: 81, papers: 123, trend: '+4%' }
  ];

  const keyMetrics = [
    { title: 'Processing Accuracy', value: '94.2%', change: '+2.1%', icon: Award, color: 'text-green-600' },
    { title: 'Avg Processing Time', value: '2.3 min', change: '-15%', icon: Clock, color: 'text-blue-600' },
    { title: 'Papers This Month', value: '1,247', change: '+18%', icon: FileText, color: 'text-purple-600' },
    { title: 'Active Teachers', value: '23', change: '+3', icon: Users, color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <Card key={index} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className={`text-sm ${metric.color} font-medium`}>{metric.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ grade, count }) => `${grade}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Performance Comparison */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-purple-500" />
              Exam Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exam" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#8B5CF6" />
                <Bar dataKey="highest" fill="#10B981" />
                <Bar dataKey="lowest" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-500" />
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPerformance.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                    <p className="text-sm text-gray-500">{subject.papers} papers graded</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{subject.avgScore}%</div>
                    <div className={`text-sm font-medium ${
                      subject.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {subject.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Statistics */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Processing Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">2.3 min</div>
              <div className="text-gray-600">Average Processing Time</div>
              <div className="text-sm text-green-600 font-medium mt-1">15% faster than last month</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">94.2%</div>
              <div className="text-gray-600">OCR Accuracy Rate</div>
              <div className="text-sm text-green-600 font-medium mt-1">2% improvement</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">1,247</div>
              <div className="text-gray-600">Papers Processed</div>
              <div className="text-sm text-green-600 font-medium mt-1">18% increase</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
