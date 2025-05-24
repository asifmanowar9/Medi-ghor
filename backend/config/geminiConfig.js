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

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(apiKey);

// Create a helper function to analyze medical test reports
export const analyzeTestReport = async (imagePath, imageType) => {
  try {
    console.log('Starting test report analysis with Gemini...');
    console.log('Image path:', imagePath);
    console.log('Image type:', imageType);

    // Use the updated model names for Gemini API
    const models = [
      { name: 'gemini-1.5-pro-vision', maxRetries: 2 }, // Updated model name
      { name: 'gemini-1.5-flash-vision', maxRetries: 2 }, // Fallback model
    ];

    // Read the image file
    const fs = await import('fs/promises');
    const imageData = await fs.readFile(imagePath);
    console.log(
      `Read image file successfully, size: ${imageData.length} bytes`
    );

    const imageBase64 = imageData.toString('base64');

    // Prepare the prompt for medical test analysis
    const prompt = `
      You are a medical professional analyzing this test report image. 
      Please provide a detailed analysis including:
      
      1. Type of test (blood test, urine test, imaging report, etc.)
      2. Key metrics and their values
      3. Abnormal values (clearly highlight these)
      4. Brief interpretation of results
      5. Potential implications
      6. General recommendations
      
      Format your response using markdown with headers and tables where appropriate.
    `;

    let lastError = null;

    // Try each model in sequence until we get a successful response or run out of models
    for (const modelConfig of models) {
      const { name, maxRetries } = modelConfig;
      console.log(`Trying model: ${name}`);

      // Get model
      const model = genAI.getGenerativeModel({ model: name });

      // Try this model with retries and exponential backoff
      let attempt = 1;

      while (attempt <= maxRetries) {
        try {
          console.log(`${name} - Attempt ${attempt}/${maxRetries}`);

          // If this is a retry and we hit rate limits last time, add exponential backoff
          if (attempt > 1 && lastError?.status === 429) {
            const backoffTime = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s, etc.
            console.log(`Rate limit hit. Backing off for ${backoffTime}ms`);
            await new Promise((resolve) => setTimeout(resolve, backoffTime));
          }

          // Make the API call
          const result = await model.generateContent([
            prompt,
            {
              inlineData: {
                data: imageBase64,
                mimeType: imageType,
              },
            },
          ]);

          const response = await result.response;
          const analysis = response.text();

          console.log(`Successfully received analysis from ${name}`);

          return {
            success: true,
            analysis,
            model: name,
          };
        } catch (error) {
          lastError = error;
          console.error(`${name} attempt ${attempt} failed:`, error.message);

          // If this is a model not found error, break immediately (no point retrying)
          if (error?.status === 404) {
            console.log(
              `Model ${name} not found or not supported. Trying next model.`
            );
            break;
          }

          // Handle rate limit and other errors
          if (error?.status === 429) {
            console.log('Rate limit error detected');

            // If there are explicit retry delay instructions from the API, use those
            const retryInfo = error.errorDetails?.find((d) =>
              d['@type']?.includes('RetryInfo')
            );

            if (retryInfo?.retryDelay) {
              const delaySeconds = parseInt(
                retryInfo.retryDelay.replace('s', '')
              );
              if (!isNaN(delaySeconds)) {
                const delayMs = (delaySeconds + 1) * 1000; // Add 1 second buffer
                console.log(
                  `API suggests waiting ${delaySeconds}s, waiting ${delayMs}ms`
                );
                await new Promise((resolve) => setTimeout(resolve, delayMs));
              }
            }
          }

          attempt++;
        }
      }

      // If we get here, we've exhausted retries for this model, continue to next model
      console.log(
        `Failed all ${maxRetries} attempts with ${name}, trying next model if available`
      );
    }

    // If we get here, all models and retries failed
    throw new Error('All API attempts failed');
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error; // Let the controller handle the error
  }
};

export default genAI;
