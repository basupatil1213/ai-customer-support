import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { openai, systemPrompt, model } from "@/config/openai-config";

export async function POST(req: NextRequest) {
    console.log(`Request: ${JSON.stringify(req.body)}`);
    
    const data = await req.json();

    const messages = data.filter((item: any) => 'role' in item);
    const requestModel = data.find((item: any) => 'model' in item)?.model;

    console.log(`Data: ${JSON.stringify(data)}, Model: ${requestModel}`);
    

    console.log(`Data: ${JSON.stringify(data)}, Model: ${requestModel}`);

    const completion = await openai.chat.completions.create({
        model: requestModel,
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            ...messages
            
        ],
        max_tokens: 300,
        stream: true
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
            try {
              // Iterate over the streamed chunks of the response
              for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
                if (content) {
                  const text = encoder.encode(content) // Encode the content to Uint8Array
                  controller.enqueue(text) // Enqueue the encoded text to the stream
                }
              }
            } catch (err) {
              controller.error(err) // Handle any errors that occur during streaming
            } finally {
              controller.close() // Close the stream when done
            }
          },
    })

    return new NextResponse(stream);
}