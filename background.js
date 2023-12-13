// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//   // Check if the URL matches a dynamic condition
//   if (tab.url && tab.url.startsWith("https://example.com/")) {
//     // Inject the content script into the matching tab
//     console.log("hi")
//     chrome.tabs.executeScript(tabId, { file: "content-script.js" });
//   }
// });

// background.js

chrome.browserAction.onClicked.addListener(function(tab) {
  // Execute the content script when the tab is clicked
  chrome.tabs.executeScript(tab.id, { file: "content-script.js" });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // Check if the tab has finished loading
  if (changeInfo.status === 'complete') {
    // Execute the content script when the page has finished loading
    chrome.tabs.executeScript(tabId, { file: "content-script.js" });
  }
});
