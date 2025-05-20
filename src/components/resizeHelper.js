export function initiateAutoResize() {
    const container = document.querySelector('#root'); // Or update to '#__next' if needed
    let prevHeight = 0;
  
    const minHeightThreshold = 100; // Define a threshold for small apps
    const extraPadding = 30; // Extra padding for small apps
  
    const resizeObserver = new ResizeObserver(() => {
      let height = container.scrollHeight;
  
      // Add extra padding for small heights
      if (height < minHeightThreshold) {
        height += extraPadding;
      }
  
      // Always send a message if the height changes (either increase or decrease)
      if (height !== prevHeight) {
        console.log("Sending resize message with height:", height);
  
        window.parent.postMessage(
          {
            height: height,
            source: "insendi-activity-resize",
          },
          "*"
        );
  
        prevHeight = height;
      }
    });
  
    resizeObserver.observe(container);
  
    // Send initial height
    const initialHeight = container.scrollHeight < minHeightThreshold 
      ? container.scrollHeight + extraPadding 
      : container.scrollHeight;
  
    window.parent.postMessage(
      {
        height: initialHeight,
        source: "insendi-activity-resize",
      },
      "*"
    );
    prevHeight = initialHeight;
  }