import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' ensures we load all variables, not just those with VITE_ prefix.
  const env = loadEnv(mode, '.', '');

  return {
    define: {
      // This strictly polyfills process.env.API_KEY with the string value from your .env file
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    // Ensure we can handle the absolute paths or specific plugins if needed, 
    // though the default setup usually handles TSX fine.
    server: {
      port: 1234, // Matching the readme instructions or standard port
      open: true,
    }
  };
});