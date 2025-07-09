
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Eye, Download, Star, TrendingUp, TrendingDown } from 'lucide-react';

const ResultsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<any>(null);
  
  const results = [
    {
      id: 1,
      studentName: 'Arjun Sharma',
      examTitle: 'Mathematics Test - Class 10A',
      score: 85,
      totalMarks: 100,
      status: 'completed',
      submittedAt: '2024-01-15',
      feedback: 'Excellent understanding of algebraic concepts. Minor calculation errors in question 3.',
      questionScores: [
        { question: 'Question 1: Linear Equations', score: 18, total: 20, feedback: 'Perfect approach and solution' },
        { question: 'Question 2: Quadratic Functions', score: 22, total: 25, feedback: 'Good method, minor arithmetic error' },
        { question: 'Question 3: Geometry', score: 20, total: 25, feedback: 'Clear diagrams and logical steps' },
        { question: 'Question 4: Statistics', score: 25, total: 30, feedback: 'Comprehensive analysis with good interpretation' }
      ]
    },
    {
      id: 2,
      studentName: 'Priya Patel',
      examTitle: 'Physics Quiz - Class 12B',
      score: 92,
      totalMarks: 100,
      status: 'completed',
      submittedAt: '2024-01-14',
      feedback: 'Outstanding performance with clear problem-solving approach.',
      questionScores: [
        { question: 'Question 1: Mechanics', score: 23, total: 25, feedback: 'Excellent use of formulas' },
        { question: 'Question 2: Thermodynamics', score: 22, total: 25, feedback: 'Good conceptual understanding' },
        { question: 'Question 3: Optics', score: 24, total: 25, feedback: 'Perfect ray diagrams' },
        { question: 'Question 4: Modern Physics', score: 23, total: 25, feedback: 'Strong grasp of quantum concepts' }
      ]
    },
    {
      id: 3,
      studentName: 'Rahul Singh',
      examTitle: 'English Essay - Class 9C',
      score: 78,
      totalMarks: 100,
      status: 'completed',
      submittedAt: '2024-01-13',
      feedback: 'Good vocabulary and structure. Work on coherence between paragraphs.',
      questionScores: [
        { question: 'Content & Ideas', score: 20, total: 25, feedback: 'Creative ideas well expressed' },
        { question: 'Grammar & Language', score: 18, total: 25, feedback: 'Few grammatical errors' },
        { question: 'Structure & Organization', score: 22, total: 25, feedback: 'Good essay structure' },
        { question: 'Creativity & Expression', score: 18, total: 25, feedback: 'Room for more creative expression' }
      ]
    }
  ];

  const filteredResults = results.filter(result =>
    result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.examTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return { color: 'bg-green-500', label: 'Excellent' };
    if (percentage >= 75) return { color: 'bg-blue-500', label: 'Good' };
    if (percentage >= 60) return { color: 'bg-yellow-500', label: 'Average' };
    return { color: 'bg-red-500', label: 'Needs Improvement' };
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by student name or exam title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.map((result) => {
          const badge = getScoreBadge(result.score, result.totalMarks);
          const percentage = Math.round((result.score / result.totalMarks) * 100);
          
          return (
            <Card key={result.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{result.studentName}</h3>
                      <Badge className={`${badge.color} text-white`}>
                        {badge.label}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{result.examTitle}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Submitted: {result.submittedAt}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {percentage >= 75 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        Performance: {percentage >= 75 ? 'Above Average' : 'Below Average'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(result.score, result.totalMarks)}`}>
                        {result.score}/{result.totalMarks}
                      </div>
                      <div className="text-sm text-gray-500">{percentage}%</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedResult(result)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl">
                              Detailed Results - {selectedResult?.studentName}
                            </DialogTitle>
                          </DialogHeader>
                          
                          {selectedResult && (
                            <div className="space-y-6">
                              {/* Overall Score */}
                              <Card>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className="font-semibold text-lg">{selectedResult.examTitle}</h3>
                                      <p className="text-gray-600">Overall Performance</p>
                                    </div>
                                    <div className="text-right">
                                      <div className={`text-3xl font-bold ${getScoreColor(selectedResult.score, selectedResult.totalMarks)}`}>
                                        {selectedResult.score}/{selectedResult.totalMarks}
                                      </div>
                                      <div className="text-lg text-gray-500">
                                        {Math.round((selectedResult.score / selectedResult.totalMarks) * 100)}%
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* AI Generated Feedback */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    AI Generated Feedback
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-gray-700 leading-relaxed">{selectedResult.feedback}</p>
                                </CardContent>
                              </Card>

                              {/* Question-wise Breakdown */}
                              <Card>
                                <CardHeader>
                                  <CardTitle>Question-wise Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {selectedResult.questionScores.map((q: any, index: number) => (
                                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-medium text-gray-900">{q.question}</h4>
                                          <span className={`font-bold ${getScoreColor(q.score, q.total)}`}>
                                            {q.score}/{q.total}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{q.feedback}</p>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredResults.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsView;
