import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// เรียกใช้งาน Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    // เลือกใช้โมเดล flash ที่เก่งเรื่องภาพและทำงานเร็ว
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // คำสั่งที่ส่งให้ AI
    const prompt = "Look at this image of food ingredients. Identify what they are, and suggest 1 simple recipe I can make with them. Format the response with clear headings.";

    // แปลงข้อมูลรูปภาพเพื่อส่งให้ Gemini
    const imageParts = [
      {
        inlineData: {
          data: imageBase64.split(',')[1], // ตัดเอาเฉพาะส่วนข้อมูล base64
          mimeType: 'image/jpeg',
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ recipe: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}