import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add the required header for Anthropic
            proxyReq.setHeader('anthropic-dangerous-direct-browser-access', 'true');
            // Remove or alter headers if Anthropic API is sensitive to them
            // For example, some APIs don't like the 'origin' header from the browser
            // proxyReq.removeHeader('origin'); 
            console.log('Proxying request to Anthropic:', proxyReq.path, proxyReq.getHeaders());
          });
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
            // Make sure to send a response to the client
            if (res && typeof res.writeHead === 'function' && typeof res.end === 'function') {
              res.writeHead(500, {
                'Content-Type': 'text/plain',
              });
              res.end('Something went wrong with the proxy.');
            } else if (res && typeof res.end === 'function') { // For HTTP/2 or other scenarios
               res.end('Something went wrong with the proxy.');
            }
          });
        }
      }
    }
  }
}); 