document.addEventListener('DOMContentLoaded', () => {
    console.log("Attempting to retrieve rewritten text");

    chrome.storage.local.get('rewrittenText', (data) => {
      const textArea = document.getElementById('rewrittenText');
      textArea.value = data.rewrittenText || "No rewritten text available";
    });
  
    document.getElementById('copyText').addEventListener('click', async () => {
      const textArea = document.getElementById('rewrittenText');
      try {
        await navigator.clipboard.writeText(textArea.value);
        console.log('Text copied successfully');
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    });

    console.log("Popup script loaded");

  });
  