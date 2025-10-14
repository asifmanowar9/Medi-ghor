import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

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
  try {
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

    // Use gemini-1.5-flash which is the current stable model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error generating medical response:', error);

    // Return a graceful fallback response
    return "I apologize, but I'm currently experiencing technical difficulties. Please try again with your question in a moment.";
  }
};

export default {
  generateMedicalResponse,
  genAI,
};
