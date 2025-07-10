
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, BookOpen, TrendingUp, Award, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalSpocs: number;
  activeSpocs: number;
  totalStudents: number;
  totalPapers: number;
  averageGrade: number;
  pendingReviews: number;
}

interface SpocStatsProps {
  stats: DashboardStats;
}

export const SpocStats: React.FC<SpocStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total SPOCs',
      value: stats.totalSpocs,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active SPOCs',
      value: stats.activeSpocs,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Papers Evaluated',
      value: stats.totalPapers.toLocaleString(),
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      change: '+23%',
      changeType: 'positive'
    },
    {
      title: 'Average Grade',
      value: `${stats.averageGrade}%`,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '+2.5%',
      changeType: 'positive'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '-5%',
      changeType: 'negative'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className={`text-xs mt-1 ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
