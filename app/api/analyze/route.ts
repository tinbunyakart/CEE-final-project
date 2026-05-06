import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse, NextRequest } from 'next/server';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    // Validate API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { imageBase64 } = await req.json();

    // Validate image data
    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Initialize model
    const model = genAI.getGenerativeModel({ model: 'gemma-4-26b-a4b-it' });

    // Prompt for recipe generation
    const prompt = "Look at this image of food ingredients. Identify what they are, and suggest 1 simple recipe I can make with them.";

    // Prepare image data
    const imageParts = [
      {
        inlineData: {
          data: imageBase64.split(',')[1],
          mimeType: 'image/jpeg',
        },
      },
    ];

    // Generate content
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ recipe: text });
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to analyze image', details: errorMessage },
      { status: 500 }
    );
  }
}