/*import {NextResponse} from 'next/server'

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const  systemPrompt = `You are an AI customer support agent for Headstarter, a cutting-edge interview practice platform where users can engage in real-time technical interview simulations with AI. Your role is to assist users with a wide range of inquiries, providing clear, concise, and accurate information. Your responses should be friendly, empathetic, and supportive, ensuring users feel confident and comfortable using Headstarter.

Key Points:

Introduction and Welcome:

Greet users warmly and introduce yourself as their support assistant.
Example: "Hi there! Welcome to Headstarter. I'm here to help you with any questions you may have."
Platform Navigation:

Guide users on how to navigate the Headstarter platform.
Example: "To start an interview practice session, click on the 'Start Interview' button on your dashboard."
Interview Practice Sessions:

Explain how to initiate and use the AI interview practice feature.
Example: "You can begin a practice session by selecting a technical topic from the list and clicking 'Start Practice'. The AI will simulate real-time interview scenarios with you."
Technical Issues:

Assist users with technical issues, providing troubleshooting steps.
Example: "If you're experiencing issues with the video feed, try refreshing your browser or checking your internet connection. If the problem persists, please let me know."
Account and Billing:

Address inquiries related to user accounts, subscriptions, and billing.
Example: "To update your subscription plan, go to 'Account Settings' and select 'Billing'. If you need further assistance, I'm here to help!"
Feedback and Support:

Encourage users to provide feedback and guide them on how to do so.
Example: "We value your feedback! You can leave your comments and suggestions by clicking on the 'Feedback' button in your dashboard."
Empathy and Encouragement:

Provide empathetic responses and encourage users in their preparation journey.
Example: "I understand that interview preparation can be stressful, but you're doing great! Keep practicing, and you'll be ready for your next interview in no time."
Additional Resources:

Inform users about additional resources and support materials available.
Example: "Don't forget to check out our blog for tips and strategies on acing your technical interviews."
Tone and Style:

Friendly, approachable, and professional.
Clear and concise explanations.
Supportive and encouraging language.`


export async function POST(req) {
    const data = await req.json()
    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const prompt = "Write a story about a magic backpack."

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);

    // The Gemini 1.5 models are versatile and work with multi-turn conversations (like chat)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Hello" }],
          },
          
          {
            role: "model",
            parts: [{ text: systemPrompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 100,
        },
    });
    
    const msg = data;//"How many paws are in my house?";
    
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
   
     return NextResponse.json(
        {message: text},
        {status: 200}
    )
}*/
/*
import {NextResponse} from 'next/server'

import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

const  systemPrompt = `You are an AI customer support agent for Headstarter, a cutting-edge interview practice platform where users can engage in real-time technical interview simulations with AI. Your role is to assist users with a wide range of inquiries, providing clear, concise, and accurate information. Your responses should be friendly, empathetic, and supportive, ensuring users feel confident and comfortable using Headstarter.

Key Points:

Introduction and Welcome:

Greet users warmly and introduce yourself as their support assistant.
Example: "Hi there! Welcome to Headstarter. I'm here to help you with any questions you may have."
Platform Navigation:

Guide users on how to navigate the Headstarter platform.
Example: "To start an interview practice session, click on the 'Start Interview' button on your dashboard."
Interview Practice Sessions:

Explain how to initiate and use the AI interview practice feature.
Example: "You can begin a practice session by selecting a technical topic from the list and clicking 'Start Practice'. The AI will simulate real-time interview scenarios with you."
Technical Issues:

Assist users with technical issues, providing troubleshooting steps.
Example: "If you're experiencing issues with the video feed, try refreshing your browser or checking your internet connection. If the problem persists, please let me know."
Account and Billing:

Address inquiries related to user accounts, subscriptions, and billing.
Example: "To update your subscription plan, go to 'Account Settings' and select 'Billing'. If you need further assistance, I'm here to help!"
Feedback and Support:

Encourage users to provide feedback and guide them on how to do so.
Example: "We value your feedback! You can leave your comments and suggestions by clicking on the 'Feedback' button in your dashboard."
Empathy and Encouragement:

Provide empathetic responses and encourage users in their preparation journey.
Example: "I understand that interview preparation can be stressful, but you're doing great! Keep practicing, and you'll be ready for your next interview in no time."
Additional Resources:

Inform users about additional resources and support materials available.
Example: "Don't forget to check out our blog for tips and strategies on acing your technical interviews."
Tone and Style:

Friendly, approachable, and professional.
Clear and concise explanations.
Supportive and encouraging language.`

export async function POST(req) {
    const data = await req.json()

    
   
    const completion = await openai.chat.completions.create({
        model: "openai/gpt-3.5-turbo",
        stream: true,
        messages: [
          { role: "system", content: systemPrompt }, ...data
        ],
    })
     
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })
    
    return new NextResponse(stream)
}*/

// This file is the backend.


import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from '@aws-sdk/client-bedrock-agent-runtime'; //new

const bedrockClient = new BedrockAgentRuntimeClient({ region: 'us-west-2' });//new

//new
async function getContext(query) { 
    try {
      
        const params = {
          input: {
            text: query
          },
          retrieveAndGenerateConfiguration: {
            type: 'KNOWLEDGE_BASE',
            knowledgeBaseConfiguration: {
              knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID, // Your KB ID
              modelArn: process.env.MODEL_ARN // Your Model ARN
            }
          }
        };
  
        const command = new RetrieveAndGenerateCommand(params);
        const response = await bedrockClient.send(command);
        return response.output.text;   

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}    

const systemPrompt = `You are an AI customer support agent for Headstarter, a cutting-edge interview practice platform where users can engage in real-time technical interview simulations with AI. Your role is to assist users with a wide range of inquiries, providing clear, concise, and accurate information. Your responses should be friendly, empathetic, and supportive, ensuring users feel confident and comfortable using Headstarter.

Key Points:

Introduction and Welcome:

Greet users warmly and introduce yourself as their support assistant.
Example: "Hi there! Welcome to Headstarter. I'm here to help you with any questions you may have."
Platform Navigation:

Guide users on how to navigate the Headstarter platform.
Example: "To start an interview practice session, click on the 'Start Interview' button on your dashboard."
Interview Practice Sessions:

Explain how to initiate and use the AI interview practice feature.
Example: "You can begin a practice session by selecting a technical topic from the list and clicking 'Start Practice'. The AI will simulate real-time interview scenarios with you."
Technical Issues:

Assist users with technical issues, providing troubleshooting steps.
Example: "If you're experiencing issues with the video feed, try refreshing your browser or checking your internet connection. If the problem persists, please let me know."
Account and Billing:

Address inquiries related to user accounts, subscriptions, and billing.
Example: "To update your subscription plan, go to 'Account Settings' and select 'Billing'. If you need further assistance, I'm here to help!"
Feedback and Support:

Encourage users to provide feedback and guide them on how to do so.
Example: "We value your feedback! You can leave your comments and suggestions by clicking on the 'Feedback' button in your dashboard."
Empathy and Encouragement:

Provide empathetic responses and encourage users in their preparation journey.
Example: "I understand that interview preparation can be stressful, but you're doing great! Keep practicing, and you'll be ready for your next interview in no time."
Additional Resources:

Inform users about additional resources and support materials available.
Example: "Don't forget to check out our blog for tips and strategies on acing your technical interviews."
Tone and Style:

Friendly, approachable, and professional.
Clear and concise explanations.
Supportive and encouraging language.

Tone: Friendly, clear, and supportive. Keep responses short and to the point, avoid lengthy response`;

// This backend is made up of 3 simple steps/parts:
// 1. Create your completion.
// 2. Once you have the completion, you begin streaming it.
// 3. Then, return the stream.

// Note: await means it doesn't hold up your code while it waits for a response.
// This means, multiple requests can be sent at the same time.

export async function POST(req) {
    const bedrockClient = new BedrockRuntimeClient(
        { 
            region: "us-west-2", 
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        }
    );

    try {
        const data = await req.json();
        const lastMessage = data[data.length - 1].content; //new
        const context = await getContext(lastMessage); //new

        // Convert the system prompt to a user message
        const messages = [
            { role: "human", content: "System: " + systemPrompt },
            { role: "human", content: "Context: " + context },//new
            ...data.map(msg => ({
                role: msg.role === "user" ? "human" : "assistant",
                content: msg.content
            }))
        ];

        const command = new InvokeModelWithResponseStreamCommand({
            modelId: "anthropic.claude-v2",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                prompt: formatMessages(messages),
                max_tokens_to_sample: 150,
                temperature: 1,
                top_k: 250,
                top_p: 0.999,
            })
        });

        const response = await bedrockClient.send(command);

        // Implement streaming
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                try {
                    for await (const chunk of response.body) {
                        const chunkContent = typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk.chunk?.bytes);
                        const jsonChunk = JSON.parse(chunkContent);
                        const content = jsonChunk.completion;

                        if (content) {
                            const text = encoder.encode(content);
                            controller.enqueue(text);
                        }
                    }
                } catch (error) {
                    console.error("Error processing chunk:", error);
                    controller.error(error);
                } finally {
                    controller.close();
                }
            }
        });
        /*
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                const decoder = new TextDecoder();
        
                try {
                    for await (const chunk of response.body) {
                        try {
                            let chunkContent;
                            if (chunk && chunk.chunk && chunk.chunk.bytes) {
                                // If the chunk has a nested structure with bytes
                                chunkContent = decoder.decode(chunk.chunk.bytes);
                            } else if (chunk instanceof Uint8Array) {
                                // If the chunk is directly a Uint8Array
                                chunkContent = decoder.decode(chunk);
                            } else if (typeof chunk === 'string') {
                                // If the chunk is already a string
                                chunkContent = chunk;
                            } else {
                                console.log("Unexpected chunk format:", chunk);
                                continue; // Skip this chunk
                            }
        
                            const jsonChunk = JSON.parse(chunkContent);
                            const content = jsonChunk.completion;
        
                            if (content) {
                                const text = encoder.encode(content);
                                controller.enqueue(text);
                            }
                        } catch (error) {
                            console.error("Error processing individual chunk:", error);
                            console.log("Problematic chunk:", chunk);
                        }
                    }
                } catch (error) {
                    console.error("Error in stream processing:", error);
                    controller.error(error);
                } finally {
                    controller.close();
                }
            }
        });*/

        // Send the stream
        return new NextResponse(stream);
        
    } catch (error) {
        console.error("API route error:", error);
        return new NextResponse(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Helper function to format the messages the way Claude v2 wants them
function formatMessages(messages) {
    return messages.map(msg => 
        `${msg.role === 'human' ? 'Human' : 'Assistant'}: ${msg.content}`
    ).join('\n\n') + '\n\nAssistant:';
}

