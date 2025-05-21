// resizeHelper.js
export function initiateLtiAutoResize() {
  const container = document.querySelector('#root') || document.querySelector('#__next');
  if (!container) {
    console.warn("LTI iFrame Resizer: Container element (#root or #__next) not found. Auto-resize will not work.");
    return;
  }

  let prevHeight = 0;
  const minHeightThreshold = 100; // Minimum height
  const extraPadding = 30;       // Padding to avoid scrollbars

  const sendResizeMessage = (height) => {
    const newHeight = Math.ceil(height);
    console.log("LTI iFrame Resizer: Sending resize message. Height:", newHeight);

    // Standard LTI resize message payload
    const messagePayload = {
      subject: "lti.frameResize", // This is the standard message subject
      height: newHeight,
    };

    if (window.parent && window.parent !== window) {
      // While Brightspace example stringified, postMessage typically handles objects.
      // Sending as an object is more common for this LTI message.
      // If issues persist with Blackboard, you could try JSON.stringify(messagePayload) here.
      window.parent.postMessage(messagePayload, "*");
    } else {
      console.warn("LTI iFrame Resizer: No parent window to send message to.");
    }
  };

  const resizeObserver = new ResizeObserver(() => {
    let currentHeight = container.scrollHeight;

    if (currentHeight < minHeightThreshold) {
      currentHeight = minHeightThreshold + extraPadding;
    } else {
      currentHeight += extraPadding;
    }

    if (Math.abs(currentHeight - prevHeight) > 1) {
      sendResizeMessage(currentHeight);
      prevHeight = currentHeight;
    }
  });

  try {
    resizeObserver.observe(container);
    console.log("LTI iFrame Resizer: ResizeObserver watching container:", container);

    setTimeout(() => {
      let initialHeight = container.scrollHeight;
      if (initialHeight < minHeightThreshold) {
        initialHeight = minHeightThreshold + extraPadding;
      } else {
        initialHeight += extraPadding;
      }
      console.log("LTI iFrame Resizer: Sending initial resize message.");
      sendResizeMessage(initialHeight);
      prevHeight = initialHeight;
    }, 250);
  } catch (error) {
    console.error("LTI iFrame Resizer: Error setting up ResizeObserver.", error);
  }

  return () => {
    console.log("LTI iFrame Resizer: Cleaning up ResizeObserver.");
    resizeObserver.disconnect();
  };
}
