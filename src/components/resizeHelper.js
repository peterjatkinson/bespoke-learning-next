// resizeHelper.js
export function initiateAutoResize(canvasPostMessageToken = null) { // canvasPostMessageToken will be null in your case
  const container = document.querySelector('#root') || document.querySelector('#__next');
  if (!container) {
    console.warn("Canvas Resizer: Container element (#root or #__next) not found. Auto-resize will not work.");
    return;
  }

  let prevHeight = 0;
  const minHeightThreshold = 100;
  const extraPadding = 30;

  const sendResizeMessage = (height) => {
    const newHeight = Math.ceil(height); // Ensure integer
    console.log("Canvas Resizer: Sending resize message to parent. Height:", newHeight);

    const messagePayload = {
      subject: "lti.frameResize", // This is the key for Canvas
      height: newHeight,
    };

    // This 'if' block will NOT execute if canvasPostMessageToken is null
    if (canvasPostMessageToken) {
      messagePayload.token = canvasPostMessageToken;
    }

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(messagePayload, "*"); // Target set to "*" as per Canvas example for this message
    } else {
      console.warn("Canvas Resizer: No parent window to send message to, or trying to post to self.");
    }
  };

  const resizeObserver = new ResizeObserver(() => {
    let currentHeight = container.scrollHeight;

    if (currentHeight < minHeightThreshold) {
      currentHeight += extraPadding;
    }

    if (currentHeight !== prevHeight) {
      sendResizeMessage(currentHeight);
      prevHeight = currentHeight;
    }
  });

  try {
    resizeObserver.observe(container);

    // Send initial height after a brief delay to allow content to fully render
    setTimeout(() => {
      let initialHeight = container.scrollHeight;
      if (initialHeight < minHeightThreshold) {
        initialHeight += extraPadding;
      }
      console.log("Canvas Resizer: Sending initial resize message.");
      sendResizeMessage(initialHeight);
      prevHeight = initialHeight;
    }, 150); // Adjust delay if needed, 100-250ms is usually fine
  } catch (error) {
    console.error("Canvas Resizer: Error setting up ResizeObserver.", error);
  }
}