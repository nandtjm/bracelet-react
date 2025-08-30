import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// WordPress Integration: Create global namespace
window.BraceletCustomizer = {
  App: App,
  React: React,
  ReactDOM: ReactDOM,
  
  // WordPress-specific initialization function
  init: function(containerId = 'bracelet-customizer-root', props = {}) {
    const container = document.getElementById(containerId);
    if (container && ReactDOM.createRoot) {
      const root = ReactDOM.createRoot(container);
      root.render(
        React.createElement(App, props)
      );
      return root;
    } else if (container && ReactDOM.render) {
      // Fallback for older React versions
      ReactDOM.render(React.createElement(App, props), container);
      return container;
    }
    console.error('BraceletCustomizer: Container not found or ReactDOM not available');
    return null;
  },
  
  // Manual render function for custom containers
  render: function(container, props = {}) {
    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    
    if (container && ReactDOM.createRoot) {
      const root = ReactDOM.createRoot(container);
      root.render(React.createElement(App, props));
      return root;
    } else if (container && ReactDOM.render) {
      ReactDOM.render(React.createElement(App, props), container);
      return container;
    }
    return null;
  }
};

// Standard React app initialization (for standalone mode)
if (document.getElementById('root')) {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Auto-initialize for WordPress if container is present
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('bracelet-customizer-root') && !document.getElementById('root')) {
    // We're in WordPress mode
    setTimeout(() => {
      window.BraceletCustomizer.init();
    }, 100); // Small delay to ensure DOM is ready
  }
});

// If you want to start measuring performance in your app, pass a function
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
