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
    console.log('Starting test report analysis with Gemini 1.5 Pro...');
    console.log('Image path:', imagePath);
    console.log('Image type:', imageType);

    // Use Gemini 1.5 Pro model instead of gemini-pro-vision
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

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

    console.log('Sending request to Gemini 1.5 Pro API...');

    // Generate content with retries
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        console.log(`API attempt ${attempts + 1}/${maxAttempts}`);

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

        console.log('Successfully received analysis from Gemini 1.5 Pro');

        return {
          success: true,
          analysis,
        };
      } catch (apiError) {
        attempts++;
        console.error(`API attempt ${attempts} failed:`, apiError);

        if (attempts >= maxAttempts) {
          throw apiError;
        }

        // Wait before retrying
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  } catch (error) {
    console.error('Gemini API error:', error);

    // Provide a detailed fallback response for better user experience
    return {
      success: false,
      error: error.message,
      analysis: `
# Medical Test Report Analysis

I apologize, but I couldn't properly analyze this medical test report image. This could be due to:

1. The image may not be clear enough
2. The format might not be recognizable
3. There might be technical difficulties with the analysis service

## Recommendations

- Try uploading a clearer image with better lighting
- Ensure the entire report is visible in the frame
- Make sure text in the image is readable
- You can also try cropping the image to focus on just the test results

If you continue to have issues, please consult with your healthcare provider directly for interpretation of your test results.
      `,
    };
  }
};

export default genAI;
