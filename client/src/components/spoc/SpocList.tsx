
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, Trash2, Users, Mail, Calendar } from 'lucide-react';

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

interface SpocListProps {
  spocs: Spoc[];
  loading: boolean;
  onEdit: (spoc: Spoc) => void;
  onDelete: (spocId: string) => void;
  onViewStudents: (spoc: Spoc) => void;
}

export const SpocList: React.FC<SpocListProps> = ({
  spocs,
  loading,
  onEdit,
  onDelete,
  onViewStudents
}) => {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          SPOC Management ({spocs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spocs.map((spoc) => (
                <TableRow key={spoc._id} className="hover:bg-gray-50/80 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {spoc.userId.name.charAt(0).toUpperCase()}
                      </div>
                      {spoc.userId.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {spoc.userId.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-50">
                      {spoc.department}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={spoc.accessLevel === 'institution' ? 'default' : 'secondary'}
                      className={spoc.accessLevel === 'institution' ? 'bg-purple-100 text-purple-800' : ''}
                    >
                      {spoc.accessLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      {spoc.managedStudents.length}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={spoc.isActive ? 'default' : 'secondary'}
                      className={spoc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    >
                      {spoc.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(spoc.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewStudents(spoc)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(spoc)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(spoc._id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {spocs.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No SPOCs found</p>
              <p className="text-gray-400 text-sm">Create your first SPOC to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
