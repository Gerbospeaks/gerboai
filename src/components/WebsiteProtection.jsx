import React, { useEffect } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

const WebsiteProtection = ({ children }) => {
  useEffect(() => {
    // Disable right-click
    const disableRightClick = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable specific keyboard shortcuts
    const disableDevTools = (e) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
      }
      // Ctrl+S (Save)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        return false;
      }
    };

    // Detect if DevTools is open (basic detection)
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        document.body.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #1a1a1a; color: white; font-family: system-ui;">
            <div style="text-align: center; max-width: 500px; padding: 40px;">
              <div style="font-size: 80px; margin-bottom: 20px;">🔒</div>
              <h1 style="font-size: 32px; margin-bottom: 16px;">Developer Tools Detected</h1>
              <p style="color: #999; font-size: 18px; margin-bottom: 24px;">
                Please close developer tools to continue browsing this website.
              </p>
              <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 12px 32px; border-radius: 8px; font-size: 16px; cursor: pointer;">
                Reload Page
              </button>
            </div>
          </div>
        `;
      }
    };

    // Disable text selection (optional - can hurt UX)
    const disableSelection = () => {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.msUserSelect = 'none';
      document.body.style.mozUserSelect = 'none';
    };

    // Disable copy
    const disableCopy = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable cut
    const disableCut = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable drag
    const disableDrag = (e) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableDevTools);
    document.addEventListener('copy', disableCopy);
    document.addEventListener('cut', disableCut);
    document.addEventListener('dragstart', disableDrag);
    
    // Check for DevTools periodically
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Optional: disable text selection
    // disableSelection();

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableDevTools);
      document.removeEventListener('copy', disableCopy);
      document.removeEventListener('cut', disableCut);
      document.removeEventListener('dragstart', disableDrag);
      clearInterval(devToolsInterval);
      
      // Re-enable text selection
      document.body.style.userSelect = 'auto';
    };
  }, []);

  return <>{children}</>;
};

// Example Usage Demo
const ProtectedApp = () => {
  return (
    <WebsiteProtection>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Warning Banner */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                  Important Security Notice
                </h3>
                <p className="text-sm text-yellow-700">
                  These protections are <strong>easily bypassed</strong> by determined users. 
                  Never rely on client-side protection for actual security. Use server-side 
                  authentication and authorization instead.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Protected Website Demo
                </h1>
                <p className="text-gray-600">Basic client-side protection enabled</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  ✅ Active Protections:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Right-click disabled</li>
                  <li>• F12 key blocked</li>
                  <li>• Ctrl+Shift+I (Inspect) blocked</li>
                  <li>• Ctrl+Shift+J (Console) blocked</li>
                  <li>• Ctrl+U (View Source) blocked</li>
                  <li>• Copy/Cut disabled</li>
                  <li>• DevTools detection active</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-300 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Try These (They're Blocked):
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Right-click anywhere on this page</li>
                  <li>• Press F12</li>
                  <li>• Press Ctrl+Shift+I</li>
                  <li>• Try to copy this text</li>
                </ul>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">
                  ⚠️ Limitations:
                </h3>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Users can still access DevTools before the page loads</li>
                  <li>• Browser extensions can bypass these protections</li>
                  <li>• Users can view the page source from the browser menu</li>
                  <li>• JavaScript can be disabled entirely</li>
                  <li>• Network tab still shows all API calls</li>
                  <li>• Code can be viewed in the browser cache</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Better Security Practices */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-green-900 mb-4">
              💡 Better Security Practices:
            </h2>
            <div className="space-y-3 text-sm text-green-800">
              <div>
                <strong>1. Server-Side Security:</strong>
                <p>Always validate and authenticate on the server. Never trust client-side data.</p>
              </div>
              <div>
                <strong>2. API Keys:</strong>
                <p>Never expose API keys or secrets in client code. Use environment variables and backend proxies.</p>
              </div>
              <div>
                <strong>3. Code Obfuscation:</strong>
                <p>Use tools like Webpack/Terser to minify and obfuscate your production code.</p>
              </div>
              <div>
                <strong>4. HTTPS Only:</strong>
                <p>Always use HTTPS to encrypt data in transit.</p>
              </div>
              <div>
                <strong>5. Content Security Policy:</strong>
                <p>Implement CSP headers to prevent XSS attacks.</p>
              </div>
              <div>
                <strong>6. Rate Limiting:</strong>
                <p>Implement rate limiting on your APIs to prevent abuse.</p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Remember: If something is displayed in a browser, it can be inspected. 
              Focus on protecting your backend and sensitive data.
            </p>
          </div>
        </div>
      </div>
    </WebsiteProtection>
  );
};

export default ProtectedApp;