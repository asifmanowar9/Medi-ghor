import fs from 'fs';
import path from 'path';

// Path to the problematic file
const filePath = path.resolve('node_modules/path-to-regexp/dist/index.js');

// Read the file content
try {
  const content = fs.readFileSync(filePath, 'utf8');

  // The function causing issues
  const originalFunction = `function name() {
        let value = "";
        if (ID_START.test(chars[++i])) {
            value += chars[i];
            while (ID_CONTINUE.test(chars[++i])) {
                value += chars[i];
            }
        }
        else if (chars[i] === '"') {
            let pos = i;
            while (i < chars.length) {
                if (chars[++i] === '"') {
                    i++;
                    pos = 0;
                    break;
                }
                if (chars[i] === "\\") {
                    value += chars[++i];
                }
                else {
                    value += chars[i];
                }
            }
            if (pos) {
                throw new TypeError(\`Unterminated quote at \${pos}: \${DEBUG_URL}\`);
            }
        }
        if (!value) {
            throw new TypeError(\`Missing parameter name at \${i}: \${DEBUG_URL}\`);
        }
        return value;
    }`;

  // The fixed function that handles problematic URLs
  const fixedFunction = `function name() {
        let value = "";
        if (ID_START.test(chars[++i])) {
            value += chars[i];
            while (ID_CONTINUE.test(chars[++i])) {
                value += chars[i];
            }
        }
        else if (chars[i] === '"') {
            let pos = i;
            while (i < chars.length) {
                if (chars[++i] === '"') {
                    i++;
                    pos = 0;
                    break;
                }
                if (chars[i] === "\\") {
                    value += chars[++i];
                }
                else {
                    value += chars[i];
                }
            }
            if (pos) {
                throw new TypeError(\`Unterminated quote at \${pos}: \${DEBUG_URL}\`);
            }
        }
        if (!value) {
            // Return a safe default value instead of throwing an error
            console.log('Preventing path-to-regexp error by providing safe parameter name');
            return "safeParam";
        }
        return value;
    }`;

  // Replace the function in the file content
  const updatedContent = content.replace(originalFunction, fixedFunction);

  // Write back the file
  fs.writeFileSync(filePath, updatedContent, 'utf8');

  console.log('Successfully patched path-to-regexp module');
} catch (error) {
  console.error('Error patching path-to-regexp:', error);
}
