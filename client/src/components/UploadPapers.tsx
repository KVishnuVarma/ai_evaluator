import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, FileImage, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const UploadPapers = () => {
  const [dragActive, setDragActive] = useState(false);
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [examTitle, setExamTitle] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [rubric, setRubric] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const { toast } = useToast();
  const { logout, user } = useAuth();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== droppedFiles.length) {
      toast({
        title: "Invalid files detected",
        description: "Please upload only image files (PNG, JPG, JPEG)",
        variant: "destructive"
      });
    }
    
    setQuestionPaper(imageFiles[0]);
    setAnswerSheet(imageFiles[1]);
  }, [toast]);

  const handleQuestionPaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQuestionPaper(e.target.files[0]);
    }
  };

  const handleAnswerSheet = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnswerSheet(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!examTitle || !totalMarks || !questionPaper || !answerSheet || !rollNo || !subject || !examDate) {
      toast({
        title: "Missing information",
        description: "Please fill all fields and upload both question paper and answer sheet.",
        variant: "destructive"
      });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('questionPaper', questionPaper);
    formData.append('answerSheet', answerSheet);
    formData.append('rollNo', rollNo);
    formData.append('subject', subject);
    formData.append('examDate', examDate);
    formData.append('maxMarks', totalMarks);
    formData.append('title', examTitle);
    formData.append('rubric', rubric);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/papers/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: formData
      });
      setUploading(false);
      setUploadProgress(100);
      if (res.ok) {
        toast({
          title: "Upload successful!",
          description: `Paper uploaded and AI evaluation started.`,
        });
        setQuestionPaper(null);
        setAnswerSheet(null);
        setRollNo('');
        setSubject('');
        setExamDate('');
        setExamTitle('');
        setTotalMarks('');
        setRubric('');
      } else {
        toast({
          title: "Upload failed",
          description: `Server error. Please try again.`,
          variant: "destructive"
        });
      }
    } catch (err) {
      setUploading(false);
      toast({
        title: "Upload failed",
        description: `Network error. Please try again.`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center mb-2">
        {user && (
          <>
            <span className="mr-4 text-gray-700">{user.name}</span>
            <Button variant="outline" onClick={logout} className="border-red-500 text-red-600 hover:bg-red-50">Logout</Button>
          </>
        )}
      </div>
      {/* Exam Details Form */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Exam Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="examTitle">Exam Title</Label>
              <Input
                id="examTitle"
                placeholder="e.g., Mathematics Test - Class 10A"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                placeholder="e.g., 100"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="rollNo">Student Roll Number</Label>
              <Input
                id="rollNo"
                placeholder="e.g., 123456"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="examDate">Exam Date</Label>
              <Input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="rubric">Marking Rubric (Optional)</Label>
            <Textarea
              id="rubric"
              placeholder="Describe the marking scheme, key points to look for, etc."
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              className="mt-1 min-h-20"
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload Area */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Upload Files (Mandatory)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="questionPaper">Question Paper *</Label>
              <Input
                id="questionPaper"
                type="file"
                accept="application/pdf,image/*"
                onChange={handleQuestionPaper}
                className="mt-1"
              />
              {questionPaper && <span className="text-sm text-gray-700">Selected: {questionPaper.name}</span>}
            </div>
            <div>
              <Label htmlFor="answerSheet">Answer Sheet *</Label>
              <Input
                id="answerSheet"
                type="file"
                accept="application/pdf,image/*"
                onChange={handleAnswerSheet}
                className="mt-1"
              />
              {answerSheet && <span className="text-sm text-gray-700">Selected: {answerSheet.name}</span>}
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Processing paper...</span>
                <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={uploading || !questionPaper || !answerSheet}
              className="px-8 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {uploading ? (
                <>
                  <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit for AI Evaluation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPapers;
