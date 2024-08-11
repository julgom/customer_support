//OPENROUTER AI

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



// RAG IMPLEMENTATION USING AWS retrieveAndGenerateConfiguration (SLOW AND STOPS WHILE GENERATING)

/* 
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

const systemPrompt = `You are the Spotify AI Assistant, designed to help users navigate the Spotify platform and enhance their music streaming experience. Your primary objectives are to provide accurate information, assist with troubleshooting, and offer personalized recommendations based on users' music preferences. You should maintain a friendly and engaging tone, ensuring that users feel supported and valued. Use the following guidelines:

User Assistance: Answer questions about account management, subscriptions, playlist creation, and features like Discover Weekly or Wrapped.

Troubleshooting: Provide solutions for common issues, such as playback problems, account access issues, or app glitches.

Personalization: Offer music recommendations based on users’ listening history, favorite genres, or moods. Ask clarifying questions to refine your suggestions.

Engagement: Encourage users to explore new music, podcasts, and playlists. Share tips on discovering new artists and genres.

Feedback: Collect user feedback on their experiences with the assistant and the Spotify platform, using this information to improve future interactions.

Limitations: If a query is beyond your capabilities or requires human intervention, inform the user politely and suggest contacting customer support.

Remember to keep the conversation natural and engaging, using a casual tone that aligns with Spotify’s brand voice. 
Important: Use no more than 200 words.`;

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

*/
// RAG IMPLEMENTATION USING Pinecone and BedrockEmbeddings instances

import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { BedrockEmbeddings } from "@langchain/aws";
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { NextResponse } from "next/server";

// Initialize embeddings with AWS Bedrock
const embeddings = new BedrockEmbeddings({
    region: "us-west-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    model: "amazon.titan-embed-text-v1",
});

// Initialize Pinecone with API key
const pinecone = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY,
});

// Helper function to generate the context for our model
async function getContext(query) {
    const vectorStore = await pinecone.Index(process.env.PINECONE_INDEX_NAME);
    const queryEmbedding = await embeddings.embedQuery(query);
    const results = await vectorStore.query({
        vector: queryEmbedding,
        topK: 3, 
        includeMetadata: true,
    });
    const result = results.matches.map(match => match.metadata.text).join("\n");
    return result + "This ios the answer to the above question, be a ai assistant and help me give a comprehensive response.";
}

// System prompt definition
const systemPrompt = `You are an AI-powered customer support bot for Spotify, a popular music streaming platform.

**Response Formatting:**
- When providing information or steps, use line breaks (\n) to create clear and separate bullet points or numbered lists.
- If the response is a list, make sure each item is on a new line for better readability.
- If the information is a paragraph, keep it concise and easy to read.

**Welcome and Introduction:**
- Greet users warmly and introduce yourself as a Spotify support bot.
- Ask how you can assist them with their Spotify experience, whether it's about music streaming, account issues, or feature inquiries.

**Identify the User's Needs:**
- Ask clarifying questions to determine the user's specific issue or question.
- Identify if the user needs help with account access, feature usage, troubleshooting technical problems, or general inquiries about Spotify's services.

**Provide Information and Solutions:**
- Offer clear and concise explanations or solutions based on the user’s needs.
- Provide an overview of Spotify’s features such as playlists, recommendations, and subscription options if the user is unfamiliar.
- Guide users through troubleshooting steps like checking internet connectivity, updating the app, or clearing the app’s cache.

**Escalate if Necessary:**
- If unable to resolve the issue, offer to escalate the matter to a human support agent.
- Provide contact information or a link to the support ticketing system if available.

**Follow-Up and Closure:**
- Confirm that the user’s issue has been resolved or their question answered to their satisfaction.
- Thank them for reaching out and encourage them to return if they need further assistance.
- End the conversation politely.

**Feedback and Improvement:**
- Ask for feedback on their support experience.
- Record feedback for continuous improvement of the support service.

Maintain a friendly, professional tone and ensure the interaction is helpful and positive.
Important: Use no more than 200 words and ensure responses are formatted for easy readability using line breaks (\n) and bullet points when listing items or steps.`;;

// POST request handler
export async function POST(req) {
    const bedrockClient = new BedrockRuntimeClient({
        region: "us-west-2",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });

    try {
        const data = await req.json();
        const lastMessage = data[data.length - 1].content;
        const context = await getContext(lastMessage);

        const messages = [
            { role: "human", content: "System: " + systemPrompt },
            { role: "human", content: "Context: " + context },
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
                max_tokens_to_sample: 300,
                temperature: 0.7,
                top_k: 250,
                top_p: 0.999,
            })
        });

        const response = await bedrockClient.send(command);

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

        return new NextResponse(stream);
    } catch (error) {
        console.error("API route error:", error);
        return new NextResponse(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function formatMessages(messages) {
    return messages.map(msg => 
        `${msg.role === 'human' ? 'Human' : 'Assistant'}: ${msg.content}`
    ).join('\n\n') + '\n\nAssistant:';
}
