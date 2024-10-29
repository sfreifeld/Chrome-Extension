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
                width: 400,
                height: 300
              })
        } else {
          console.log("No text selected");
        }
      });
    }
  });
  
  async function rewriteWithAI(selectedText) {
    try {
      // Check the model's capabilities first
      const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities()
  
      if (available !== "no") {
        // Create a session with the language model
        const session = await ai.languageModel.create()
  
        // Prompt the model with the selected text and await the result
        const result = await session.prompt(`Please rephrase the following text to be more professional, concise, and formal. Only provide the revised text without additional explanations: ${selectedText}`);
        console.log(result)
        // Log the response or return it for further processing
        return result;
      } else {
        console.error("Model not available for rewriting text.");
        return null;
      }
    } catch (error) {
      console.error("Error rewriting text with AI:", error);
      return null;
    }
  }
  