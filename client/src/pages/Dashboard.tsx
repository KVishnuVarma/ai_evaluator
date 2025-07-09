import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, BarChart3, Users, Clock, CheckCircle, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminUploadForm from '@/components/admin/AdminUploadForm';
import ResultsView from '@/components/ResultsView';
import Analytics from '@/components/Analytics';
import SpocManagement from '@/components/admin/SpocManagement';
import Settings from '@/components/Settings';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  
  const [recentUploads] = useState([
    { id: 1, name: 'Math Test - Class 10A', status: 'completed', papers: 25, avgScore: 78, student: 'John Doe', rollNo: '21CS001' },
    { id: 2, name: 'Physics Quiz - Class 12B', status: 'processing', papers: 30, avgScore: null, student: 'Jane Smith', rollNo: '21CS002' },
    { id: 3, name: 'English Essay - Class 9C', status: 'completed', papers: 20, avgScore: 85, student: 'Mike Johnson', rollNo: '21CS003' }
  ]);

  const stats = [
    { title: 'Papers Processed Today', value: '47', icon: FileText, color: 'bg-blue-500' },
    { title: 'Active Students', value: '156', icon: Users, color: 'bg-green-500' },
    { title: 'Avg Processing Time', value: '1.8 min', icon: Clock, color: 'bg-purple-500' },
    { title: 'AI Accuracy Rate', value: '96.8%', icon: CheckCircle, color: 'bg-orange-500' }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header with User Info */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              AI Paper Correction System
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>Welcome, {user?.name}</span>
              <Badge variant="outline" className="capitalize">
                {user?.role}
              </Badge>
              {user?.subjects && (
                <span>Subjects: {user.subjects.join(', ')}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm border">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Papers
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              View Results
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="spocs" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Manage SPOCs
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <AdminUploadForm />
          </TabsContent>

          <TabsContent value="results">
            <ResultsView />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="spocs">
            <SpocManagement />
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
