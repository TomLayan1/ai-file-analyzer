import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get('file') as Blob | null;
    const prompt = formData.get('prompt') as string;

    console.log("Received prompt:", prompt);
    console.log("Received file:", file);

    if (!file || !prompt) {
      return NextResponse.json({ error: 'Missing file or prompt' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64string = Buffer.from(arrayBuffer).toString('base64');

    const result = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'file', data: base64string, mimeType: file.type },
          ],
        },
      ],
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error in upload route:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}