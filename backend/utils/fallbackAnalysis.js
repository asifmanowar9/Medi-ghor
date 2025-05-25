import fs from 'fs/promises';
import sharp from 'sharp';

/**
 * Get basic image statistics
 */
export const getImageStats = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    const stats = {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: (await fs.stat(imagePath)).size,
    };
    return stats;
  } catch (error) {
    console.error('Error getting image stats:', error);
    return {
      width: 'unknown',
      height: 'unknown',
      format: 'unknown',
      size: 'unknown',
    };
  }
};

/**
 * Generate fallback analysis when AI services are unavailable
 */
export const generateFallbackAnalysis = (imageStats, filename) => {
  return `# Medical Test Report Analysis

## Service Status

I'm currently experiencing difficulties connecting to the AI analysis services. I've captured your medical test report image but cannot perform a detailed analysis at this moment.

## Image Information

| Property | Value |
|----------|-------|
| Filename | ${filename} |
| Image Type | ${imageStats.format} |
| Dimensions | ${imageStats.width}×${imageStats.height} |
| File Size | ${Math.round(imageStats.size / 1024)} KB |

## Recommendations

- Please try again in a few minutes as our analysis services may be temporarily unavailable
- Ensure the image is clear and all text is legible
- If the problem persists, you can discuss the report directly with your healthcare provider

## Next Steps

Your image has been saved and you can continue this conversation later when our services are available again.

> **Note:** This is a fallback response as our analysis services are currently experiencing technical difficulties. We apologize for the inconvenience.`;
};
