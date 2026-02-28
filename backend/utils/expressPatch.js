import Module from 'module';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, 'express-debug.log');
fs.writeFileSync(logFile, '=== Express Router Debug ===\n', 'utf8');

// Patch Express Router's Layer class
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id) {
  const result = originalRequire.call(this, id);

  // Patch Express's Router functionality
  if (id === 'express') {
    console.log('🔧 Patching Express Router');
    fs.appendFileSync(logFile, 'Patching Express Router\n', 'utf8');

    // Wait for Router to be loaded before patching Layer
    const originalRouter = result.Router;
    result.Router = function () {
      const router = originalRouter.apply(this, arguments);

      // Patch route method
      const originalRoute = router.route;
      router.route = function (path) {
        try {
          if (path && typeof path === 'string') {
            // Log all route registrations
            fs.appendFileSync(logFile, `Registering route: ${path}\n`, 'utf8');

            // Check and fix problematic URLs
            if (path.startsWith('http://') || path.startsWith('https://')) {
              console.log(`⚠️ Found URL as route path: ${path}`);
              fs.appendFileSync(
                logFile,
                `Fixed URL route: ${path} -> /api/safe-route\n`,
                'utf8'
              );
              path = '/api/safe-route';
            }

            // Specifically check for the problematic URL
            if (path === 'https://git.new/pathToRegexpError') {
              console.log('🔄 Fixed known problematic URL in route');
              fs.appendFileSync(
                logFile,
                'Fixed known problematic URL\n',
                'utf8'
              );
              path = '/api/safe-path';
            }
          }
          return originalRoute.call(this, path);
        } catch (error) {
          console.error('❌ Error in router.route:', error);
          fs.appendFileSync(
            logFile,
            `Error in route: ${error.message}\n`,
            'utf8'
          );
          return originalRoute.call(this, '/api/error-route');
        }
      };

      return router;
    };
  }

  return result;
};

console.log('📋 Express Router patches loaded');
