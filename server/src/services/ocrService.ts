// services/ocrService.ts
import fs from 'fs';
import path from 'path';

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
}

export class OCRService {
  static async extractTextFromImage(filePath: string): Promise<OCRResult> {
    try {
      // Mock OCR implementation - replace with actual OCR service like Tesseract.js, Google Vision API, etc.
      const fileExists = fs.existsSync(filePath);
      if (!fileExists) {
        throw new Error('File not found for OCR processing');
      }

      // Simulate OCR processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock extracted text - replace with actual OCR logic
      const mockText = `
        Student Answer Paper
        
        Question 1: What is the capital of France?
        Answer: Paris is the capital of France. It is located in the northern part of the country.
        
        Question 2: Explain photosynthesis.
        Answer: Photosynthesis is the process by which plants convert sunlight into energy using chlorophyll.
        
        Question 3: Solve 2x + 5 = 15
        Answer: 2x = 15 - 5 = 10, therefore x = 5
      `;

      return {
        text: mockText.trim(),
        confidence: 0.95,
        language: 'en'
      };
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  static async extractTextFromPDF(filePath: string): Promise<OCRResult> {
    try {
      // Mock PDF text extraction - replace with actual PDF parsing like pdf-parse
      const fileExists = fs.existsSync(filePath);
      if (!fileExists) {
        throw new Error('PDF file not found');
      }

      // Mock PDF text extraction
      const mockText = `
        Student Answer Paper - PDF Format
        
        Name: John Doe
        Roll No: 2023001
        
        Question 1: What is machine learning?
        Answer: Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.
        
        Question 2: Explain database normalization.
        Answer: Database normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.
      `;

      return {
        text: mockText.trim(),
        confidence: 0.98,
        language: 'en'
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  static async processFile(filePath: string): Promise<OCRResult> {
    const extension = path.extname(filePath).toLowerCase();
    
    switch (extension) {
      case '.pdf':
        return await this.extractTextFromPDF(filePath);
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.tiff':
      case '.bmp':
        return await this.extractTextFromImage(filePath);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }
}

// services/gradingService.ts
export interface GradingCriteria {
  subject: string;
  maxMarks: number;
  rubric: {
    [key: string]: {
      points: number;
      description: string;
    };
  };
}

export interface AIGradingResult {
  score: number;
  maxScore: number;
  percentage: number;
  feedback: string;
  breakdown: {
    question: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  confidence: number;
  suggestedImprovements: string[];
}

export class GradingService {
  private static readonly AI_MODELS = {
    GPT4: 'gpt-4',
    GPT3_5: 'gpt-3.5-turbo',
    CLAUDE: 'claude-3'
  };

  static async gradeWithAI(
    extractedText: string,
    criteria: GradingCriteria,
    modelType: string = this.AI_MODELS.GPT3_5
  ): Promise<AIGradingResult> {
    try {
      // Mock AI grading - replace with actual AI service integration
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

      // Mock grading logic based on text analysis
      const questions = this.extractQuestions(extractedText);
      const breakdown = questions.map((question, index) => ({
        question: `Question ${index + 1}`,
        score: Math.floor(Math.random() * 10) + 5, // Mock scoring
        maxScore: 15,
        feedback: this.generateQuestionFeedback(question)
      }));

      const totalScore = breakdown.reduce((sum, item) => sum + item.score, 0);
      const maxTotalScore = breakdown.reduce((sum, item) => sum + item.maxScore, 0);
      const percentage = Math.round((totalScore / maxTotalScore) * 100);

      return {
        score: totalScore,
        maxScore: criteria.maxMarks,
        percentage,
        feedback: this.generateOverallFeedback(percentage),
        breakdown,
        confidence: 0.87,
        suggestedImprovements: this.generateImprovements(percentage)
      };
    } catch (error) {
      console.error('AI grading error:', error);
      throw new Error('Failed to grade paper with AI');
    }
  }

  private static extractQuestions(text: string): string[] {
    // Simple question extraction based on patterns
    const questionPattern = /Question \d+:.*?(?=Question \d+:|$)/gs;
    const matches = text.match(questionPattern);
    return matches || [];
  }

  private static generateQuestionFeedback(questionText: string): string {
    const feedbacks = [
      'Good understanding of the concept. Well explained.',
      'Correct answer but could be more detailed.',
      'Partially correct. Missing some key points.',
      'Shows good analytical thinking.',
      'Needs improvement in explanation clarity.'
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  }

  private static generateOverallFeedback(percentage: number): string {
    if (percentage >= 90) return 'Excellent work! Shows strong understanding of all concepts.';
    if (percentage >= 80) return 'Good performance. Minor areas for improvement.';
    if (percentage >= 70) return 'Satisfactory work. Some concepts need more clarity.';
    if (percentage >= 60) return 'Below average. Significant improvement needed.';
    return 'Poor performance. Requires substantial study and practice.';
  }

  private static generateImprovements(percentage: number): string[] {
    const improvements = [
      'Provide more detailed explanations',
      'Include relevant examples',
      'Improve handwriting clarity',
      'Better time management',
      'Review fundamental concepts'
    ];
    
    const count = percentage < 70 ? 3 : 2;
    return improvements.slice(0, count);
  }

  static async validateGrading(
    aiResult: AIGradingResult,
    teacherFeedback?: string
  ): Promise<AIGradingResult> {
    // Logic to validate AI grading against teacher feedback
    // This could involve re-running the AI with teacher context
    return aiResult;
  }

  static async batchGrade(
    papers: Array<{ text: string; criteria: GradingCriteria }>,
    modelType?: string
  ): Promise<AIGradingResult[]> {
    const results: AIGradingResult[] = [];
    
    for (const paper of papers) {
      try {
        const result = await this.gradeWithAI(paper.text, paper.criteria, modelType);
        results.push(result);
      } catch (error) {
        console.error('Batch grading error for paper:', error);
        // Continue with other papers even if one fails
      }
    }
    
    return results;
  }
}