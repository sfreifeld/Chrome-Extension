chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "rewriteText",
      title: "Rewrite Text",
      contexts: ["selection"]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error creating context menu:", chrome.runtime.lastError)
      } else {
        console.log("Context menu created successfully")
      }
    })
  })
  
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "rewriteText") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      }, async (selection) => {
        const selectedText = selection[0]?.result
        if (selectedText) {
            const rewrittenText = await rewriteWithAI(selectedText)
            console.log("Rewritten Text:", rewrittenText)
            chrome.storage.local.set({ rewrittenText: rewrittenText })
            chrome.windows.create({
                url: "popup.html",
                type: "popup",
                width: 500,
                height: 400
              })
        } else {
          console.log("No text selected");
        }
      });
    }
  });
  
  async function rewriteWithAI(selectedText) {
    try {
      // Get the formality level from storage
      const result = await chrome.storage.sync.get(['formalityLevel']);
      const formalityLevel = result.formalityLevel || 3; // Default to 3 if not set
      const formalityString = 
        formalityLevel == 1 ? 'casual and friendly' :
        formalityLevel == 2 ? 'informal and conversational' :
        formalityLevel == 3 ? 'neutral and professional' :
        formalityLevel == 4 ? 'formal and polite' :
        'highly formal and diplomatic';

      // Check the model's capabilities first
      const { available } = await ai.languageModel.capabilities();
  
      if (available !== "no") {
        const session = await ai.languageModel.create();
  
        // Updated prompt that includes formality level
        const result = await session.prompt(
          `Please rephrase the following text to be ${formalityString}. Only provide the revised text without additional explanations: ${selectedText}`
        );
        
        const cleanResult = result.trim().replace(/(^"|"$)/g, '');
        console.log(cleanResult);
        return cleanResult;
      } else {
        console.error("Model not available for rewriting text.");
        return null;
      }
    } catch (error) {
      console.error("Error rewriting text with AI:", error);
      return null;
    }
  }
  
  // Add this check to ensure the commands API is available
  if (chrome.commands) {
    chrome.commands.onCommand.addListener(async (command) => {
      if (command === "rewrite-text") {
          // Get the active tab
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          
          // Execute the same script as your context menu handler
          chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => window.getSelection().toString()
          }, async (selection) => {
              const selectedText = selection[0]?.result;
              if (selectedText) {
                  const rewrittenText = await rewriteWithAI(selectedText);
                  console.log("Rewritten Text:", rewrittenText);
                  chrome.storage.local.set({ rewrittenText: rewrittenText });
                  chrome.windows.create({
                      url: "popup.html",
                      type: "popup",
                      width: 500,
                      height: 400
                  });
              } else {
                  console.log("No text selected");
              }
          });
      }
    });
  }
  