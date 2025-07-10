import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  FileText, 
  BookOpen, 
  TrendingUp, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  UserPlus,
  BarChart3,
  Calendar,
  Award
} from 'lucide-react';
import { SpocList } from '@/components/spoc/SpocList';
import { SpocForm } from '@/components/spoc/SpocForm';
import { SpocStudents } from '@/components/spoc/SpocStudents';
import { SpocReports } from '@/components/spoc/SpocReports';
import { SpocStats } from '@/components/spoc/SpocStats';
import { useAuth } from '@/contexts/AuthContext';

interface Spoc {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  department: string;
  accessLevel: 'department' | 'institution';
  managedStudents: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalSpocs: number;
  activeSpocs: number;
  totalStudents: number;
  totalPapers: number;
  averageGrade: number;
  pendingReviews: number;
}

const SpocDashboard = () => {
  const { user, logout } = useAuth();
  const [spocs, setSpocs] = useState<Spoc[]>([]);
  const [selectedSpoc, setSelectedSpoc] = useState<Spoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalSpocs: 0,
    activeSpocs: 0,
    totalStudents: 0,
    totalPapers: 0,
    averageGrade: 0,
    pendingReviews: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
    // fetch students/reports for this SPOC's subject(s) here if needed
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/spoc/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        throw new Error('Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setStats({
        totalSpocs: 0,
        activeSpocs: 0,
        totalStudents: 0,
        totalPapers: 0,
        averageGrade: 0,
        pendingReviews: 0
      });
    }
  };

  const handleCreateSpoc = async (spocData: any) => {
    try {
      const response = await fetch('/api/spoc/full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(spocData)
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "SPOC created successfully"
        });
        setShowCreateForm(false);
        fetchDashboardStats();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create SPOC",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSpoc = async (spocId: string) => {
    if (!confirm('Are you sure you want to delete this SPOC?')) return;

    try {
      const response = await fetch(`/api/spoc/${spocId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "SPOC deleted successfully"
        });
        fetchDashboardStats();
      } else {
        throw new Error('Failed to delete SPOC');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete SPOC",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-end items-center mb-2">
          {user && (
            <>
              <span className="mr-4 text-gray-700">{user.name}</span>
              <Button variant="outline" onClick={logout} className="border-red-500 text-red-600 hover:bg-red-50">Logout</Button>
            </>
          )}
        </div>
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SPOC Dashboard</h1>
          <p className="text-gray-600 mt-1">View your subject's students, scores, and reports</p>
        </div>

        <SpocStats stats={stats} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Average Grade</span>
                        <span className="font-medium">{stats.averageGrade}%</span>
                      </div>
                      <Progress value={stats.averageGrade} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Active SPOCs Rate</span>
                        <span className="font-medium">{Math.round((stats.activeSpocs / stats.totalSpocs) * 100)}%</span>
                      </div>
                      <Progress value={(stats.activeSpocs / stats.totalSpocs) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm">New papers submitted</span>
                      <Badge variant="secondary">12</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm">Papers graded today</span>
                      <Badge variant="secondary">8</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm">Pending reviews</span>
                      <Badge variant="destructive">{stats.pendingReviews}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students">
            {/* Only show students for this SPOC's subject(s) */}
            <SpocStudents spoc={user} />
          </TabsContent>

          <TabsContent value="reports">
            {/* Only show reports for this SPOC's subject(s) */}
            <SpocReports spoc={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SpocDashboard;
