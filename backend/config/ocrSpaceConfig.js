import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs/promises';
import path from 'path';

// OCR.Space API Key - get free key from https://ocr.space/ocrapi/freekey
const API_KEY = process.env.OCR_SPACE_API_KEY || 'helloworld'; // Replace with your key

/**
 * Analyze a test report image using OCR.Space API
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<object>} Analysis results
 */
export const analyzeTestReportWithOCR = async (imagePath) => {
  try {
    console.log('Starting test report analysis with OCR.Space...');
    console.log('Processing image path:', imagePath);

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
    formData.append('file', imageData, 'image.jpg');

    console.log('Sending request to OCR.Space API...');

    // Send request to OCR.Space API
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    // Check if response is OK
    if (!response.ok) {
      throw new Error(`OCR.Space API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Check if OCR was successful
    if (!result.IsErroredOnProcessing) {
      console.log('OCR.Space analysis completed successfully');
      const extractedText = result.ParsedResults[0].ParsedText;

      // Process the extracted text into a medical report analysis
      const analysis = analyzeExtractedMedicalText(
        extractedText,
        path.basename(imagePath)
      );

      return {
        success: true,
        analysis,
        model: 'ocr-space',
        confidence: result.OCRExitCode === 1 ? 85 : 70,
        extractedText,
      };
    } else {
      throw new Error(`OCR processing error: ${result.ErrorMessage[0]}`);
    }
  } catch (error) {
    console.error('OCR.Space API error:', error);
    throw error;
  }
};

/**
 * Process extracted text to generate medical report analysis
 */
function analyzeExtractedMedicalText(text, filename = '') {
  // Determine test type based on content
  const lowerText = text.toLowerCase();
  let testType = identifyTestType(lowerText);

  // Extract measurements using regex patterns
  const measurements = extractMeasurements(text);

  // Find abnormal values (high/low indicators)
  const abnormalValues = findAbnormalValues(text, measurements);

  // Generate medical report analysis in markdown format
  let analysis = `# ${testType} Report Analysis\n\n`;

  // Add report summary
  analysis += `## Report Summary\n\n`;
  analysis += `This appears to be a ${testType.toLowerCase()}`;
  if (abnormalValues.length > 0) {
    analysis += ` with ${abnormalValues.length} potentially abnormal value(s) that may require attention`;
  } else {
    analysis += `. Based on the OCR text extraction, no clearly abnormal values were detected`;
  }
  analysis += `.\n\n`;

  // Add extracted measurements table
  if (measurements.length > 0) {
    analysis += `## Key Metrics\n\n`;
    analysis += `| Test | Value | Unit | Reference Range |\n`;
    analysis += `|------|-------|------|----------------|\n`;

    for (const measurement of measurements) {
      analysis += `| ${measurement.name} | ${measurement.value} | ${
        measurement.unit || '-'
      } | ${measurement.referenceRange || '-'} |\n`;
    }
    analysis += `\n`;
  }

  // Add abnormal values section
  if (abnormalValues.length > 0) {
    analysis += `## Abnormal Values\n\n`;
    analysis += `| Test | Value | Unit | Status | Reference Range |\n`;
    analysis += `|------|-------|------|--------|----------------|\n`;

    for (const abnormal of abnormalValues) {
      analysis += `| ${abnormal.name} | **${abnormal.value}** | ${
        abnormal.unit || '-'
      } | **${abnormal.flag}** | ${abnormal.referenceRange || '-'} |\n`;
    }
    analysis += `\n`;
  }

  // Add interpretation section based on test type
  analysis += `## Interpretation\n\n`;
  analysis += getInterpretationByTestType(testType, abnormalValues.length > 0);

  // Add recommendations
  analysis += `## Recommendations\n\n`;
  analysis += `- Review this analysis with your healthcare provider\n`;
  analysis += `- Discuss any abnormal values and their significance\n`;
  analysis += `- Consider follow-up testing if recommended by your doctor\n`;
  analysis += `- Maintain regular health check-ups\n\n`;

  // Add disclaimer
  analysis += `> **Important:** This analysis is based on automated text extraction from your test report image and may not be complete or entirely accurate. Always consult with your healthcare provider for proper interpretation of medical test results.`;

  return analysis;
}

/**
 * Identify the type of medical test from the text
 */
function identifyTestType(text) {
  // Blood test indicators
  if (
    text.includes('blood') ||
    text.includes('hematology') ||
    text.includes('haematology') ||
    text.includes('cbc') ||
    text.includes('complete blood count') ||
    text.includes('hemoglobin') ||
    text.includes('haemoglobin') ||
    text.includes('hgb') ||
    text.includes('wbc') ||
    text.includes('rbc') ||
    text.includes('platelets') ||
    text.includes('cholesterol') ||
    text.includes('triglycerides') ||
    text.includes('hdl') ||
    text.includes('ldl')
  ) {
    return 'Blood Test';
  }

  // Urine test indicators
  if (
    text.includes('urine') ||
    text.includes('urinalysis') ||
    text.includes('specific gravity') ||
    text.includes('leukocytes') ||
    text.includes('nitrite') ||
    text.includes('urobilinogen')
  ) {
    return 'Urine Analysis';
  }

  // Imaging indicators
  if (
    text.includes('x-ray') ||
    text.includes('xray') ||
    text.includes('radiograph') ||
    text.includes('ct scan') ||
    text.includes('mri') ||
    text.includes('ultrasound') ||
    text.includes('radiology') ||
    text.includes('imaging')
  ) {
    return 'Imaging Report';
  }

  // Diabetes test indicators
  if (
    ((text.includes('glucose') || text.includes('sugar')) &&
      (text.includes('fasting') ||
        text.includes('post') ||
        text.includes('random'))) ||
    text.includes('hba1c') ||
    text.includes('a1c') ||
    text.includes('glycosylated')
  ) {
    return 'Diabetes Test';
  }

  // Thyroid test indicators
  if (
    text.includes('thyroid') ||
    text.includes('tsh') ||
    text.includes('t3') ||
    text.includes('t4') ||
    text.includes('thyroxine')
  ) {
    return 'Thyroid Function Test';
  }

  // Liver function test indicators
  if (
    text.includes('liver') ||
    text.includes('alt') ||
    text.includes('ast') ||
    text.includes('alp') ||
    text.includes('bilirubin') ||
    text.includes('albumin') ||
    text.includes('sgpt') ||
    text.includes('sgot')
  ) {
    return 'Liver Function Test';
  }

  // Kidney function test indicators
  if (
    text.includes('kidney') ||
    text.includes('renal') ||
    text.includes('creatinine') ||
    text.includes('bun') ||
    text.includes('urea') ||
    text.includes('egfr') ||
    text.includes('gfr')
  ) {
    return 'Kidney Function Test';
  }

  // Default
  return 'Medical Test';
}

/**
 * Extract measurements from text using regex patterns
 */
function extractMeasurements(text) {
  const measurements = [];
  const lines = text.split('\n');

  // Common patterns in medical reports
  const patterns = [
    // Pattern: Test Name: 123 unit (reference: 10-20)
    /([A-Za-z\s\-\/]+)[:=]\s*(\d+\.?\d*)\s*([A-Za-z\/%\[\]]+)?(?:\s*\((?:ref|reference|normal|range)?\s*(?:range|value)?:?\s*([\d\.-]+\s*-\s*[\d\.-]+).*\))?/i,

    // Pattern: Test Name 123 unit
    /([A-Za-z\s\-\/]+)\s+(\d+\.?\d*)\s*([A-Za-z\/%\[\]]+)?/,

    // Pattern with H/L indicators: Test Name: 123 H unit
    /([A-Za-z\s\-\/]+)[:=]\s*(\d+\.?\d*)\s*([HL])\s*([A-Za-z\/%\[\]]+)?/i,
  ];

  for (const line of lines) {
    // Skip short or empty lines
    if (line.trim().length < 5) continue;

    // Try each pattern
    for (const pattern of patterns) {
      const match = line.match(pattern);

      if (match) {
        let name, value, unit, referenceRange;

        // Handle different pattern matches
        if (match.length >= 4) {
          name = match[1].trim();
          value = match[2].trim();
          unit = match[3] ? match[3].trim() : '';

          // Check if the third group is 'H' or 'L' instead of a unit
          if (unit === 'H' || unit === 'L') {
            // This is a flag, not a unit
            unit = match[4] ? match[4].trim() : '';
          }

          // Look for reference range in the same line or pattern match
          referenceRange =
            match[4] && match[4].includes('-') ? match[4].trim() : '';

          // If no reference range in the pattern, try to find it in the line
          if (!referenceRange) {
            const rangeMatch = line.match(
              /\(?\s*(?:ref|reference|normal)(?:\s+range)?:?\s*([\d\.-]+\s*-\s*[\d\.-]+).?\)?/i
            );
            if (rangeMatch) referenceRange = rangeMatch[1].trim();
          }

          // Add to measurements
          measurements.push({
            name,
            value,
            unit,
            referenceRange,
          });

          // Found a match, no need to try other patterns
          break;
        }
      }
    }
  }

  return measurements;
}

/**
 * Find abnormal values based on high/low indicators
 */
function findAbnormalValues(text, measurements) {
  const abnormalValues = [];
  const lines = text.split('\n');

  // Check each measurement against indicators in the text
  for (const measurement of measurements) {
    let isAbnormal = false;
    let flag = '';

    // Look for this measurement in all lines
    for (const line of lines) {
      if (line.includes(measurement.name)) {
        // Check for high indicators
        if (
          line.includes(' H ') ||
          line.includes(' HIGH') ||
          line.includes('High') ||
          line.includes('ABOVE') ||
          line.includes('increased')
        ) {
          isAbnormal = true;
          flag = 'HIGH';
          break;
        }

        // Check for low indicators
        if (
          line.includes(' L ') ||
          line.includes(' LOW') ||
          line.includes('Low') ||
          line.includes('BELOW') ||
          line.includes('decreased')
        ) {
          isAbnormal = true;
          flag = 'LOW';
          break;
        }

        // Check for general abnormal indicators
        if (
          line.includes('abnormal') ||
          line.includes('ABNORMAL') ||
          line.includes('*') ||
          line.includes('!')
        ) {
          isAbnormal = true;
          flag = 'ABNORMAL';
          break;
        }
      }
    }

    // If it has a reference range, try to determine if it's out of range
    if (!isAbnormal && measurement.referenceRange && measurement.value) {
      try {
        const value = parseFloat(measurement.value);
        const range = measurement.referenceRange.split('-');
        if (range.length === 2) {
          const min = parseFloat(range[0]);
          const max = parseFloat(range[1]);

          if (!isNaN(value) && !isNaN(min) && !isNaN(max)) {
            if (value < min) {
              isAbnormal = true;
              flag = 'LOW';
            } else if (value > max) {
              isAbnormal = true;
              flag = 'HIGH';
            }
          }
        }
      } catch (e) {
        // Error parsing numbers, just continue
      }
    }

    // Add to abnormal values list if flagged
    if (isAbnormal) {
      abnormalValues.push({
        ...measurement,
        flag,
      });
    }
  }

  return abnormalValues;
}

/**
 * Get interpretation text based on test type
 */
function getInterpretationByTestType(testType, hasAbnormalValues) {
  const abnormalityStatement = hasAbnormalValues
    ? 'Some abnormal values were detected that may require attention.'
    : 'Based on the OCR analysis, all values appear to be within normal ranges.';

  switch (testType) {
    case 'Blood Test':
      return `This report shows results from a blood test which measures various components in your blood. ${abnormalityStatement} Blood tests help evaluate overall health, detect infections, assess organ function, and monitor chronic conditions.\n\n`;

    case 'Urine Analysis':
      return `This is a urinalysis report which examines your urine's physical, chemical, and microscopic properties. ${abnormalityStatement} Urinalysis helps detect urinary tract infections, kidney disease, diabetes, and other conditions.\n\n`;

    case 'Imaging Report':
      return `This appears to be an imaging report that provides visual information about your internal organs or structures. ${abnormalityStatement} Imaging studies help diagnose various conditions, injuries, or diseases.\n\n`;

    case 'Diabetes Test':
      return `This is a diabetes-related test that measures blood glucose levels. ${abnormalityStatement} These tests help diagnose diabetes, monitor blood sugar control, and assess the effectiveness of diabetes treatments.\n\n`;

    case 'Thyroid Function Test':
      return `This report contains thyroid function test results which measure how well your thyroid gland is working. ${abnormalityStatement} These tests help diagnose and monitor conditions like hypothyroidism, hyperthyroidism, and other thyroid disorders.\n\n`;

    case 'Liver Function Test':
      return `This appears to be a liver function test panel that assesses the health and function of your liver. ${abnormalityStatement} These tests help detect liver disease, monitor liver function, and evaluate the side effects of certain medications.\n\n`;

    case 'Kidney Function Test':
      return `This report contains kidney function tests which evaluate how well your kidneys are working. ${abnormalityStatement} These tests help detect kidney disease, monitor kidney function, and assess the progression of known kidney disorders.\n\n`;

    default:
      return `This medical report contains health-related measurements and values. ${abnormalityStatement} Please consult with your healthcare provider for a complete interpretation of these results.\n\n`;
  }
}

export default {
  analyzeTestReportWithOCR,
};
