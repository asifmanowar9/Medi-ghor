import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Utility function to check available Gemini models
 * Can be run via Node.js to debug model availability issues
 */
const checkAvailableModels = async () => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing from environment variables!');
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // List available models
    const modelList = await genAI.listModels();

    console.log('Available Gemini models:');
    modelList.models.forEach((model) => {
      console.log(`- ${model.name} (${model.displayName})`);
      console.log(
        `  Supported generation methods: ${model.supportedGenerationMethods.join(
          ', '
        )}`
      );
      console.log();
    });

    return modelList.models;
  } catch (error) {
    console.error('Error fetching models:', error);
  }
};

// You can call this function directly when troubleshooting
// Uncomment the following line to run the check
// checkAvailableModels();

export default checkAvailableModels;
