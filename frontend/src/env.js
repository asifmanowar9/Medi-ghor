// Define process.env if it doesn't exist in the browser environment
if (typeof process === 'undefined' || !process.env) {
  window.process = {
    env: {
      NODE_ENV: 'development',
    },
  };
}

export default window.process;
