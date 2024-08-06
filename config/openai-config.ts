import OpenAI from "openai";

export const model = "gpt-4o-mini";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_KEY,
    timeout: 60000,
})

export const systemPrompt = "";

// const output = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages : [
//         {
//             role: "system",
//             content: "You are a helpful assistant."
//         },
//         {
//             role: "user",
//             content: "Write a One week notice letter."
//         }
//     ],
//     max_tokens: 300,
//     stream: true
// });

// for await (const chat of output){
//     process.stdout.write(chat.choices[0]?.delta?.content || '');
// }




