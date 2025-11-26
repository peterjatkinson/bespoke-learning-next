// Universal resize implementation that works with both Insendi and Canvas LMS
export function initiateAutoResize() {
  const container = document.querySelector('#root') || document.querySelector('#__next');
  if (!container) {
    console.warn("Auto Resizer: Container element (#root or #__next) not found.");
    return () => {}; // Return empty cleanup function
  }

  let prevHeight = 0;
  const minHeightThreshold = 100;
  const extraPadding = 30;
  let timeoutId = null;

  const sendResizeMessage = (height) => {
    const newHeight = Math.ceil(height);
    console.log("Auto Resizer: Sending resize message to parent. Height:", newHeight);

    if (window.parent && window.parent !== window) {
      // Send Insendi format
      window.parent.postMessage(
        {
          height: newHeight,
          source: "insendi-activity-resize",
        },
        "*"
      );

      // Send Canvas format
      const canvasPayload = {
        subject: "lti.frameResize",
        height: newHeight,
      };

      // Include token if available (for Canvas LTI)
      if (typeof window !== 'undefined' && window.LTI_POST_MESSAGE_TOKEN) {
        canvasPayload.token = window.LTI_POST_MESSAGE_TOKEN;
      }

      window.parent.postMessage(canvasPayload, "*");
    } else {
      console.log("Auto Resizer: Not in an iframe, skipping resize.");
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

    // Send initial height after a brief delay to allow content to render
    timeoutId = setTimeout(() => {
      let initialHeight = container.scrollHeight;
      if (initialHeight < minHeightThreshold) {
        initialHeight += extraPadding;
      }
      console.log("Auto Resizer: Sending initial resize message.");
      sendResizeMessage(initialHeight);
      prevHeight = initialHeight;
    }, 150);
  } catch (error) {
    console.error("Auto Resizer: Error setting up ResizeObserver.", error);
  }

  // Return cleanup function
  return () => {
    console.log("Auto Resizer: Cleaning up");
    resizeObserver.disconnect();
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}
