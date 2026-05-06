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
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

    // Prompt for recipe generation
    const prompt = `Identify ingredients in the image and suggest 1 recipe. 
                    OUTPUT ONLY the ingredients list and instructions. 
                    STRICTLY FORBIDDEN to include any thinking process, analysis, or introductory text like "Here is a thinking process..." or "Based on the image...".
                    Start immediately with the heading "## Identified Ingredients".`;

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