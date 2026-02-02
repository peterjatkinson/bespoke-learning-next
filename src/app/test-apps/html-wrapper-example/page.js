"use client";

import { useEffect } from 'react';

export default function HtmlWrapperExample() {
  // Set up JavaScript functions that the HTML will call
  useEffect(() => {
    let count = 0;

    window.incrementCounter = function() {
      count++;
      document.getElementById('counter-display').textContent = 'Count: ' + count;
    };

    window.resetCounter = function() {
      count = 0;
      document.getElementById('counter-display').textContent = 'Count: ' + count;
    };

    // Cleanup
    return () => {
      delete window.incrementCounter;
      delete window.resetCounter;
    };
  }, []);

  const htmlContent = `
    <div class="container" style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #333; border-bottom: 2px solid #0066cc;">Plain HTML Wrapper Example</h1>

      <p style="font-size: 16px; line-height: 1.6;">
        This is a demonstration of wrapping plain HTML content inside a Next.js page.js file.
        Notice that we're using regular HTML syntax here - <code>class</code> instead of
        <code>className</code>, inline <code>style</code> attributes as strings, etc.
      </p>

      <h2 style="color: #0066cc;">Features of this approach:</h2>
      <ul style="line-height: 1.8;">
        <li>No need to convert class to className</li>
        <li>Keep your original HTML syntax</li>
        <li>Inline JavaScript works</li>
        <li>Perfect for migrating existing HTML pages</li>
      </ul>

      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Interactive Example</h3>
        <button onclick="alert('This inline onclick works!')" style="background-color: #0066cc; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
          Click Me
        </button>
      </div>

      <table border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #0066cc; color: white;">
            <th>Feature</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Plain HTML syntax</td>
            <td>✓ Supported</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td>Inline styles</td>
            <td>✓ Supported</td>
          </tr>
          <tr>
            <td>Inline JavaScript</td>
            <td>✓ Supported</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td>No React conversion needed</td>
            <td>✓ Supported</td>
          </tr>
        </tbody>
      </table>

      <h2 style="color: #0066cc;">JavaScript Functions</h2>
      <p>You can include functions by defining them on the window object in useEffect:</p>

      <div id="counter-display" style="font-size: 24px; margin: 10px 0;">Count: 0</div>
      <button onclick="incrementCounter()" style="background-color: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
        Increment
      </button>
      <button onclick="resetCounter()" style="background-color: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
        Reset
      </button>

      <hr style="margin: 30px 0;">

      <footer style="text-align: center; color: #666; font-size: 14px;">
        <p>This entire page is plain HTML wrapped in dangerouslySetInnerHTML</p>
        <p>No JSX conversion required!</p>
      </footer>
    </div>
  `;

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
