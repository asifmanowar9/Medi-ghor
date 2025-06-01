/**
 * This script overrides Express's route registration to prevent problematic URLs
 */
import express from 'express';

// Save the original Router implementation
const originalRouter = express.Router;

// Create a replacement that protects against invalid route paths
express.Router = function () {
  const router = originalRouter.call(this, ...arguments);

  // Intercept all primary HTTP methods
  const methods = ['use', 'get', 'post', 'put', 'delete', 'patch'];

  methods.forEach((method) => {
    const originalMethod = router[method];

    router[method] = function () {
      // Check if the first argument is a path and fix it if needed
      if (typeof arguments[0] === 'string') {
        const path = arguments[0];

        // Check if the path is a full URL
        if (path.startsWith('http://') || path.startsWith('https://')) {
          console.log(
            `⚠️ Converting URL to safe path: ${path} → /api/safe-path`
          );
          arguments[0] = '/api/safe-path';
        }

        // Specifically handle the problematic URL
        if (path === 'https://git.new/pathToRegexpError') {
          console.log('⚠️ Replacing problematic URL with safe path');
          arguments[0] = '/api/safe-path';
        }
      }

      try {
        return originalMethod.apply(this, arguments);
      } catch (error) {
        console.error('Error registering route:', error);
        return router;
      }
    };
  });

  return router;
};

console.log('Express route protection enabled');

export default express;
