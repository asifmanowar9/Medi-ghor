import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
// Add this import at the top with more complete fetch API components
import fetch, { Headers, Request, Response } from 'node-fetch';

// Make all fetch API components globally available
globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;

// Ensure environment variables are loaded
dotenv.config();

// Log key presence (not the full key for security)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is missing from environment variables!');
} else {
  console.log(`GEMINI_API_KEY found with length ${apiKey.length}`);
}

// Initialize the Gemini API with your API key directly in this file
const genAI = new GoogleGenerativeAI(apiKey);

// List of models to try in order of preference (based on available models from API)
const AVAILABLE_MODELS = [
  'gemini-2.5-flash', // Fast and efficient
  'gemini-2.0-flash', // Stable version
  'gemini-pro-latest', // Latest pro model
  'gemini-flash-latest', // Latest flash model
  'gemini-2.5-pro', // Most capable model
];

/**
 * Generate a medical AI response for the chat
 * @param {string} userMessage - The user's message
 * @param {Array} chatHistory - Previous messages in the chat
 * @returns {Promise<string>} - AI response
 */
export const generateMedicalResponse = async (
  userMessage,
  chatHistory = []
) => {
  console.log('Generating medical AI response...');

  // Format the chat history and user's question as context
  const recentMessages = chatHistory.slice(-6); // Last 6 messages for context

  const prompt = `
    You are a helpful medical assistant providing information about health questions, symptoms, medications, and general medical topics.
    Always remind users to consult healthcare professionals for medical advice, diagnosis, or treatment.
    Base your responses on established medical knowledge and avoid speculative statements.
    
    Previous conversation:
    ${recentMessages
      .map(
        (msg) =>
          `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      )
      .join('\n')}
    
    User's current question: ${userMessage}
    
    Provide a helpful, informative response about this medical topic. If discussing medications or treatments, 
    explain general information and always advise consulting a healthcare provider.
    If discussing symptoms, provide general information about possible causes and when to seek medical attention.
    Format your response using markdown for better readability.
  `;

  // Try models in order of preference
  for (const modelName of AVAILABLE_MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`Successfully used model: ${modelName}`);
      return text;
    } catch (error) {
      console.error(`Model ${modelName} failed:`, error.message);

      // If this is the last model in the list, handle the error
      if (modelName === AVAILABLE_MODELS[AVAILABLE_MODELS.length - 1]) {
        console.error('All models failed, returning fallback response');

        // Handle specific error types and provide helpful feedback
        let errorMessage =
          "I apologize, but I'm currently experiencing technical difficulties with the AI assistant. ";

        if (error.status === 404) {
          errorMessage += 'The AI models are currently unavailable. ';
        } else if (error.status === 429) {
          errorMessage += "I'm receiving too many requests right now. ";
        } else if (error.status === 403) {
          errorMessage +=
            "There's an authentication issue with the AI service. ";
        }

        errorMessage +=
          'Please try again in a moment, or feel free to upload any medical test reports for analysis using the attachment button.';

        return errorMessage;
      }

      // Continue to next model
      continue;
    }
  }
};

export default {
  generateMedicalResponse,
  genAI,
  AVAILABLE_MODELS,
};
