
// resizeHelper.js
export function initiateBrightspaceAutoResize() {
  const container = document.querySelector('#root') || document.querySelector('#__next');
  if (!container) {
    console.warn("Brightspace iFrame Resizer: Container element (#root or #__next) not found. Auto-resize will not work.");
    return;
  }

  let prevHeight = 0;
  const minHeightThreshold = 100; // Minimum height to prevent collapsing too small
  const extraPadding = 30;       // Extra padding to avoid scrollbars

  const sendResizeMessage = (height) => {
    const newHeight = Math.ceil(height); // Ensure integer
    console.log("Brightspace iFrame Resizer: Sending resize message to parent. Height:", newHeight);

    // Payload based on Brightspace's example code
    const messagePayload = {
      subject: "lti.frameResize",
      height: newHeight,
    };

    if (window.parent && window.parent !== window) {
      // Brightspace example uses JSON.stringify, but postMessage can often handle objects directly.
      // However, to be perfectly aligned with their example, stringifying is safer.
      // Most modern browsers will auto-stringify if the second argument is an object,
      // but explicit stringification matches their example.
      window.parent.postMessage(JSON.stringify(messagePayload), "*");
    } else {
      console.warn("Brightspace iFrame Resizer: No parent window to send message to, or trying to post to self.");
    }
  };

  const resizeObserver = new ResizeObserver(() => {
    let currentHeight = container.scrollHeight;

    if (currentHeight < minHeightThreshold) {
      currentHeight = minHeightThreshold + extraPadding;
    } else {
      currentHeight += extraPadding;
    }

    if (Math.abs(currentHeight - prevHeight) > 1) { // Only send if height changed meaningfully
      sendResizeMessage(currentHeight);
      prevHeight = currentHeight;
    }
  });

  try {
    resizeObserver.observe(container);
    console.log("Brightspace iFrame Resizer: ResizeObserver watching container:", container);

    // Send initial height after a brief delay
    setTimeout(() => {
      let initialHeight = container.scrollHeight;
      if (initialHeight < minHeightThreshold) {
        initialHeight = minHeightThreshold + extraPadding;
      } else {
        initialHeight += extraPadding;
      }
      console.log("Brightspace iFrame Resizer: Sending initial resize message.");
      sendResizeMessage(initialHeight);
      prevHeight = initialHeight;
    }, 250); // Adjust delay if needed
  } catch (error) {
    console.error("Brightspace iFrame Resizer: Error setting up ResizeObserver.", error);
  }

  // Return a cleanup function for the observer
  return () => {
    console.log("Brightspace iFrame Resizer: Cleaning up ResizeObserver.");
    resizeObserver.disconnect();
  };
}