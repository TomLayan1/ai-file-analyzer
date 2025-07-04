"use server"

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';


export const getAiResult = async (prompt: string, files: File) => {
  const arrayBuffer = await files.arrayBuffer();
  const base64string = Buffer.from(arrayBuffer).toString('base64');

  const result = await generateText({
    model: google('gemini-1.5-flash'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
          {
            type: 'file',
            data: base64string,
            mimeType: files.type,
          },
        ],
      },
    ],
  });

  console.log(result);
  return result;
}

// "use server";

// import { google } from "@ai-sdk/google";
// import { generateText } from "ai";

// export const getAiResult = async (formData: FormData): Promise<string> => {
//   const prompt = formData.get("prompt") as string;
//   const base64 = formData.get("base64") as string;
//   const mimeType = formData.get("mimeType") as string;

//   if (!prompt || !base64 || !mimeType) {
//     throw new Error("Missing prompt, file, or mime type.");
//   }

//   const result = await generateText({
//     model: google("gemini-1.5-flash"),
//     messages: [
//       {
//         role: "user",
//         content: [
//           { type: "text", text: prompt },
//           {
//             type: "file",
//             data: base64,
//             mimeType,
//           },
//         ],
//       },
//     ],
//   });

//   return JSON.stringify(result);
// };
