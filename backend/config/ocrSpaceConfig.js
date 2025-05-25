import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs/promises';
import path from 'path';

// OCR.Space API Key
const API_KEY = process.env.OCR_SPACE_API_KEY;

// Set timeout for fetch request - increase if needed
const FETCH_TIMEOUT = 60000; // 60 seconds

/**
 * Fetch with timeout function to prevent hanging requests
 */
const fetchWithTimeout = async (url, options, timeout) => {
  const controller = new AbortController();
  const signal = controller.signal;

  // Add signal to options
  const optionsWithSignal = {
    ...options,
    signal,
  };

  // Create timeout to abort if it takes too long
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, optionsWithSignal);
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

/**
 * Analyze a test report image using OCR.Space API
 */
export const analyzeTestReportWithOCR = async (imagePath) => {
  try {
    console.log('Starting test report analysis with OCR.Space...');
    console.log('Processing image path:', imagePath);

    // Validate file exists and check size
    const stats = await fs.stat(imagePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`Image size: ${fileSizeMB.toFixed(2)}MB`);

    // The image should already be compressed, but double-check
    if (fileSizeMB > 5) {
      throw new Error(
        'Image file is too large even after compression. Please use a smaller image.'
      );
    }

    // Read image file
    const imageData = await fs.readFile(imagePath);
    console.log(
      `Image file read successfully, size: ${imageData.length} bytes`
    );

    // Create form data for API request
    const formData = new FormData();
    formData.append('apikey', API_KEY);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('scale', 'true');
    formData.append('detectOrientation', 'true');
    formData.append('OCREngine', '2'); // More accurate OCR engine
    formData.append('file', imageData, path.basename(imagePath));

    console.log('Sending request to OCR.Space API...');

    // Send request to OCR.Space API with timeout
    const response = await fetchWithTimeout(
      'https://api.ocr.space/parse/image',
      {
        method: 'POST',
        body: formData,
      },
      FETCH_TIMEOUT
    );

    // Handle non-successful responses
    if (!response.ok) {
      throw new Error(
        `OCR.Space API HTTP error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    // Check if OCR was successful
    if (!result.IsErroredOnProcessing) {
      console.log('OCR.Space analysis completed successfully');
      const extractedText = result.ParsedResults[0].ParsedText;
      const confidence =
        result.OCRExitCode === 1
          ? parseFloat(result.ParsedResults[0].TextOrientation || '85')
          : 70;

      return {
        success: true,
        analysis: processExtractedText(extractedText),
        model: 'ocr-space',
        confidence,
        extractedText,
      };
    } else {
      throw new Error(`OCR processing error: ${result.ErrorMessage}`);
    }
  } catch (error) {
    console.error('OCR.Space API error:', error.message);

    // Handle common OCR.Space errors more gracefully
    if (error.message.includes('timeout') || error.message.includes('E101')) {
      throw new Error(
        'The OCR service timed out. Your image may be too complex or the service is busy. Please try again later.'
      );
    }

    throw error;
  }
};

/**
 * Process the extracted text into a nicely formatted medical analysis
 */
function processExtractedText(text) {
  // Basic formatting to make the extracted text more readable
  return `# Medical Test Report Analysis

## Extracted Content

${text}

## Recommendations

* Review this text with your healthcare provider
* If the text doesn't appear accurate, try uploading a clearer image
* For precise interpretation of medical values, consult with a medical professional

> Note: This is a machine extraction of text from your image. Accuracy may vary depending on image quality.`;
}

export default {
  analyzeTestReportWithOCR,
};
