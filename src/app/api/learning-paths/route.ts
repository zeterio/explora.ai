import { NextRequest } from 'next/server';
import { successResponse, apiResponses } from '@/lib/utils/api-response';

/**
 * Learning path interface
 */
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  milestones: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  createdAt: number;
  updatedAt: number;
}

// Dummy data for testing
const dummyLearningPaths: LearningPath[] = [
  {
    id: '1',
    title: 'Introduction to Machine Learning',
    description: 'A beginner-friendly path to learn the basics of machine learning concepts.',
    milestones: [
      { id: '1-1', title: 'Understanding Data', completed: false },
      { id: '1-2', title: 'Supervised Learning', completed: false },
      { id: '1-3', title: 'Unsupervised Learning', completed: false },
    ],
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 86400000,
  },
  {
    id: '2',
    title: 'Web Development Fundamentals',
    description: 'Learn the core technologies that power the modern web.',
    milestones: [
      { id: '2-1', title: 'HTML & CSS Basics', completed: true },
      { id: '2-2', title: 'JavaScript Essentials', completed: false },
      { id: '2-3', title: 'Building a Simple Application', completed: false },
    ],
    createdAt: Date.now() - 172800000, // 2 days ago
    updatedAt: Date.now() - 86400000,
  },
];

/**
 * GET handler for learning paths
 * Retrieves all learning paths for the current user
 * 
 * @route GET /api/learning-paths
 * @returns {object} 200 - Array of learning paths
 */
export async function GET() {
  try {
    // In a real implementation, this would fetch data from a database
    // based on the authenticated user
    return successResponse(dummyLearningPaths);
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return apiResponses.internalServerError();
  }
}

/**
 * POST handler for creating a new learning path
 * 
 * @route POST /api/learning-paths
 * @body {object} learningPath - Learning path to create
 * @returns {object} 201 - Created learning path
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return apiResponses.badRequest('Title is required');
    }
    
    // Create a new learning path (simulated)
    const newLearningPath: LearningPath = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description || '',
      milestones: body.milestones || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // In a real implementation, this would save to a database
    
    return successResponse(newLearningPath, undefined, 201);
  } catch (error) {
    console.error('Error creating learning path:', error);
    return apiResponses.internalServerError();
  }
} 