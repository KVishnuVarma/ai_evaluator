
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, FileImage, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminUploadForm = () => {
  const [formData, setFormData] = useState({
    rollNo: '',
    studentName: '',
    section: '',
    subject: '',
    examTitle: '',
    totalMarks: '',
    description: ''
  });
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Biology'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file: File, type: 'question' | 'answer') => {
    if (type === 'question') {
      setQuestionPaper(file);
    } else {
      setAnswerSheet(file);
    }
  };

  const removeFile = (type: 'question' | 'answer') => {
    if (type === 'question') {
      setQuestionPaper(null);
    } else {
      setAnswerSheet(null);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = ['rollNo', 'studentName', 'section', 'subject', 'examTitle', 'totalMarks'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0 || !questionPaper || !answerSheet) {
      toast({
        title: "Missing required information",
        description: "Please fill all mandatory fields and upload both question paper and answer sheet",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload and AI processing
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          
          // Simulate AI processing result
          const aiScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
          const grade = aiScore >= 90 ? 'A+' : aiScore >= 80 ? 'A' : aiScore >= 70 ? 'B+' : 'B';
          
          toast({
            title: "Processing completed!",
            description: `AI has evaluated the paper. Score: ${aiScore}/${formData.totalMarks} (Grade: ${grade})`,
          });

          // Reset form
          setFormData({
            rollNo: '',
            studentName: '',
            section: '',
            subject: '',
            examTitle: '',
            totalMarks: '',
            description: ''
          });
          setQuestionPaper(null);
          setAnswerSheet(null);
          
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Student Information (Mandatory)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="rollNo">Roll Number *</Label>
              <Input
                id="rollNo"
                value={formData.rollNo}
                onChange={(e) => handleInputChange('rollNo', e.target.value)}
                placeholder="e.g., 21CS001"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="studentName">Student Name *</Label>
              <Input
                id="studentName"
                value={formData.studentName}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
                placeholder="Enter student name"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="section">Section *</Label>
              <Input
                id="section"
                value={formData.section}
                onChange={(e) => handleInputChange('section', e.target.value)}
                placeholder="e.g., A"
                className="mt-1"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Exam Details (Mandatory)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="examTitle">Exam Title *</Label>
              <Input
                id="examTitle"
                value={formData.examTitle}
                onChange={(e) => handleInputChange('examTitle', e.target.value)}
                placeholder="e.g., Mid-term Examination"
                className="mt-1"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalMarks">Total Marks *</Label>
              <Input
                id="totalMarks"
                type="number"
                value={formData.totalMarks}
                onChange={(e) => handleInputChange('totalMarks', e.target.value)}
                placeholder="e.g., 100"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Additional notes (optional)"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Upload Files (Mandatory)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Paper Upload */}
          <div>
            <Label className="text-base font-medium">Question Paper *</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'question')}
                className="hidden"
                id="question-upload"
              />
              <label htmlFor="question-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Upload Question Paper</p>
              </label>
            </div>
            {questionPaper && (
              <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileImage className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">{questionPaper.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile('question')}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Answer Sheet Upload */}
          <div>
            <Label className="text-base font-medium">Answer Sheet *</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'answer')}
                className="hidden"
                id="answer-upload"
              />
              <label htmlFor="answer-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Upload Answer Sheet</p>
              </label>
            </div>
            {answerSheet && (
              <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileImage className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">{answerSheet.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile('answer')}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Processing Progress */}
          {uploading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">AI is processing the answer sheet...</span>
                <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-gray-500">
                This may take a few moments while AI analyzes the handwriting and evaluates the answers.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={uploading}
            className="w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {uploading ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                Processing with AI...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit for AI Evaluation
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUploadForm;
