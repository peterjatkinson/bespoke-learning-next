// resizeHelper.js
export function initiateAutoResize(ltiPostMessageToken = null) { // Renamed for clarity, still null in your current non-LTI use case
  const container = document.querySelector('#root') || document.querySelector('#__next');
  if (!container) {
    console.warn("LMS iFrame Resizer: Container element (#root or #__next) not found. Auto-resize will not work.");
    return;
  }

  let prevHeight = 0;
  const minHeightThreshold = 100; // Minimum height to prevent collapsing too small
  const extraPadding = 30; // Extra padding to avoid scrollbars due to minor rendering differences

  const sendResizeMessage = (height) => {
    const newHeight = Math.ceil(height); // Ensure integer
    console.log("LMS iFrame Resizer: Sending resize message to parent. Height:", newHeight);

    // Construct a message payload that should be compatible with both Canvas and Brightspace
    const messagePayload = {
      subject: "lti.frameResize",    // Standard key, used by Canvas and in Brightspace example
      handler: "lti.frameResize",    // Key mentioned in Brightspace documentation text
      height: newHeight,
    };

    // This 'if' block will NOT execute if ltiPostMessageToken is null
    // It's primarily for LTI 1.3 scenarios where a token might be required (e.g., by Canvas)
    if (ltiPostMessageToken) {
      messagePayload.token = ltiPostMessageToken;
    }

    if (window.parent && window.parent !== window) {
      // Post the message to the parent window.
      // The targetOrigin "*" is generally acceptable for this type of non-sensitive resize message,
      // but for LTI launches, the LMS often provides a specific target origin.
      // For non-LTI embedded iframes, "*" is common.
      window.parent.postMessage(messagePayload, "*");
    } else {
      console.warn("LMS iFrame Resizer: No parent window to send message to, or trying to post to self.");
    }
  };

  const resizeObserver = new ResizeObserver((entries) => {
    // We only care about the contentRect.height or scrollHeight
    // scrollHeight is often more reliable for the overall content size
    let currentHeight = container.scrollHeight;

    // Apply min height threshold and padding
    if (currentHeight < minHeightThreshold) {
      currentHeight = minHeightThreshold + extraPadding;
    } else {
      currentHeight += extraPadding;
    }

    // Only send a message if the height has actually changed significantly
    if (Math.abs(currentHeight - prevHeight) > 1) { // Check for more than 1px change
      sendResizeMessage(currentHeight);
      prevHeight = currentHeight;
    }
  });

  try {
    resizeObserver.observe(container);
    console.log("LMS iFrame Resizer: ResizeObserver watching container:", container);

    // Send initial height after a brief delay to allow content to fully render
    setTimeout(() => {
      let initialHeight = container.scrollHeight;
      if (initialHeight < minHeightThreshold) {
        initialHeight = minHeightThreshold + extraPadding;
      } else {
        initialHeight += extraPadding;
      }
      console.log("LMS iFrame Resizer: Sending initial resize message.");
      sendResizeMessage(initialHeight);
      prevHeight = initialHeight;
    }, 250); // Increased delay slightly, adjust if needed
  } catch (error) {
    console.error("LMS iFrame Resizer: Error setting up ResizeObserver.", error);
  }

  // Optional: Cleanup observer when component unmounts (if ResizeWrapper handles unmounting)
  // This would typically be returned from the useEffect in ResizeWrapper if initiateAutoResize returned a cleanup function.
  // For simplicity here, we'll assume the app's lifecycle manages this, or it's a long-lived iframe.
  // To implement cleanup:
  // return () => {
  //   console.log("LMS iFrame Resizer: Cleaning up ResizeObserver.");
  //   resizeObserver.disconnect();
  // };
}