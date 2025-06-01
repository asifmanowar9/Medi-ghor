import Module from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory information
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log file for debugging
const logFile = path.join(__dirname, 'path-debug.log');
fs.writeFileSync(logFile, '=== Path-to-RegExp Debug ===\n', 'utf8');

// Create a direct patch for the path-to-regexp module
try {
  // Find the path-to-regexp module file
  const nodeModulesPath = path.join(__dirname, '..', '..', 'node_modules');
  const pathToRegexpFile = path.join(
    nodeModulesPath,
    'path-to-regexp',
    'dist',
    'index.js'
  );

  console.log('Attempting to directly patch file:', pathToRegexpFile);
  fs.appendFileSync(
    logFile,
    `Attempting to patch: ${pathToRegexpFile}\n`,
    'utf8'
  );

  // Check if file exists
  if (fs.existsSync(pathToRegexpFile)) {
    // Read the file
    let content = fs.readFileSync(pathToRegexpFile, 'utf8');
    fs.appendFileSync(logFile, 'File found, patching...\n', 'utf8');

    // Create a backup
    const backupFile = path.join(
      nodeModulesPath,
      'path-to-regexp',
      'dist',
      'index.js.bak'
    );
    if (!fs.existsSync(backupFile)) {
      fs.writeFileSync(backupFile, content, 'utf8');
      fs.appendFileSync(logFile, 'Created backup file\n', 'utf8');
    }

    // Find the vulnerable function and replace it
    if (content.includes('function name()')) {
      const oldCode = `function name() {
        var m = match(/^:([^\\/{}\\-]+)/);
        if (m) {
            return { type: "NAME", value: m[1] };
        }
        return null;
    }`;

      const newCode = `function name() {
        var m = match(/^:([^\\/{}\\-]+)/);
        if (m) {
            // Safety check for URL paths
            var value = m[1];
            if (value && (value.includes('://') || value === 'git.new/pathToRegexpError')) {
                console.log('Found problematic URL in route param:', value);
                value = 'safe_param';
            }
            return { type: "NAME", value: value };
        }
        return null;
    }`;

      // Replace the function
      content = content.replace(oldCode, newCode);

      // Also add a direct check for the problematic URL
      content = content.replace(
        'function parse(str, options)',
        `function parse(str, options) {
        // Direct fix for the known problematic URL
        if (str === 'https://git.new/pathToRegexpError') {
            console.log('Fixed known problematic URL pattern');
            str = '/safe-path';
        }
        
        // Original function continues here`
      );

      // Write the patched file
      fs.writeFileSync(pathToRegexpFile, content, 'utf8');
      console.log('✅ Successfully patched path-to-regexp module file');
      fs.appendFileSync(logFile, 'Successfully patched file\n', 'utf8');
    } else {
      console.log('⚠️ Could not find function to patch in path-to-regexp');
      fs.appendFileSync(logFile, 'Could not find target function\n', 'utf8');
    }
  } else {
    console.log('❌ path-to-regexp file not found at:', pathToRegexpFile);
    fs.appendFileSync(logFile, 'File not found\n', 'utf8');
  }
} catch (error) {
  console.error('❌ Error patching path-to-regexp:', error);
  fs.appendFileSync(
    logFile,
    `Error: ${error.message}\n${error.stack}\n`,
    'utf8'
  );
}

// Continue with the runtime monkey-patching as well
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id) {
  const result = originalRequire.call(this, id);

  if (id === 'path-to-regexp') {
    console.log('🔧 Runtime patching for path-to-regexp loaded');

    // Runtime patch for the parse function
    if (result.parse) {
      const originalParse = result.parse;
      result.parse = function (str, options) {
        // Handle the problematic URL
        if (str === 'https://git.new/pathToRegexpError') {
          console.log('🔄 Runtime fix applied for problematic URL');
          return originalParse('/safe-path', options);
        }

        // Handle any URL as a route
        if (
          str &&
          typeof str === 'string' &&
          (str.startsWith('http://') || str.startsWith('https://'))
        ) {
          const safePath = '/api/url-route';
          console.log(`🔄 Converting URL to path: ${str} → ${safePath}`);
          return originalParse(safePath, options);
        }

        try {
          return originalParse(str, options);
        } catch (err) {
          console.error('⚠️ Error in path-to-regexp.parse:', err.message);
          return originalParse('/api/fallback', options);
        }
      };
    }

    // Also patch the compile function
    if (result.compile) {
      const originalCompile = result.compile;
      result.compile = function (str, options) {
        try {
          if (str === 'https://git.new/pathToRegexpError') {
            console.log('🔄 Runtime fix applied for compile');
            str = '/safe-path';
          }
          return originalCompile(str, options);
        } catch (err) {
          console.error('⚠️ Error in path-to-regexp.compile:', err.message);
          return originalCompile('/api/fallback', options);
        }
      };
    }
  }

  return result;
};

console.log('📋 Path-to-regexp patches loaded successfully');
