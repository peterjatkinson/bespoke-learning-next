// Insendi LMS resize implementation
export function initiateInsendiResize() {
  const container = document.querySelector('#root') || document.querySelector('#__next');
  if (!container) {
    console.warn("Insendi Resizer: Container element (#root or #__next) not found.");
    return () => {}; // Return empty cleanup function
  }

  let prevHeight = 0;
  const minHeightThreshold = 100;
  const extraPadding = 30;

  const sendResizeMessage = (height) => {
    console.log("Insendi Resizer: Sending resize message with height:", height);

    window.parent.postMessage(
      {
        height: height,
        source: "insendi-activity-resize",
      },
      "*"
    );
  };

  const resizeObserver = new ResizeObserver(() => {
    let height = container.scrollHeight;

    if (height < minHeightThreshold) {
      height += extraPadding;
    }

    if (height !== prevHeight) {
      sendResizeMessage(height);
      prevHeight = height;
    }
  });

  resizeObserver.observe(container);

  // Send initial height
  const initialHeight = container.scrollHeight < minHeightThreshold
    ? container.scrollHeight + extraPadding
    : container.scrollHeight;

  sendResizeMessage(initialHeight);
  prevHeight = initialHeight;

  // Return cleanup function
  return () => {
    console.log("Insendi Resizer: Cleaning up");
    resizeObserver.disconnect();
  };
}

// Canvas LMS resize implementation
export function initiateCanvasResize(canvasPostMessageToken = null) {
  const container = document.querySelector('#root') || document.querySelector('#__next');
  if (!container) {
    console.warn("Canvas Resizer: Container element (#root or #__next) not found.");
    return () => {}; // Return empty cleanup function
  }

  let prevHeight = 0;
  const minHeightThreshold = 100;
  const extraPadding = 30;
  let timeoutId = null;

  const sendResizeMessage = (height) => {
    const newHeight = Math.ceil(height);
    console.log("Canvas Resizer: Sending resize message to parent. Height:", newHeight);

    const messagePayload = {
      subject: "lti.frameResize",
      height: newHeight,
    };

    if (canvasPostMessageToken) {
      messagePayload.token = canvasPostMessageToken;
    }

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(messagePayload, "*");
    } else {
      console.warn("Canvas Resizer: No parent window to send message to.");
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

    // Send initial height after a brief delay
    timeoutId = setTimeout(() => {
      let initialHeight = container.scrollHeight;
      if (initialHeight < minHeightThreshold) {
        initialHeight += extraPadding;
      }
      console.log("Canvas Resizer: Sending initial resize message.");
      sendResizeMessage(initialHeight);
      prevHeight = initialHeight;
    }, 150);
  } catch (error) {
    console.error("Canvas Resizer: Error setting up ResizeObserver.", error);
  }

  // Return cleanup function
  return () => {
    console.log("Canvas Resizer: Cleaning up");
    resizeObserver.disconnect();
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

// Default export for backward compatibility (currently defaults to Insendi)
export function initiateAutoResize() {
  initiateInsendiResize();
}
