// HTML button elements

window.onload = function () {
  const buttonLock = document.getElementById("lock");
  buttonLock.addEventListener("click", buttonClick);
};

function buttonClick() {
  // const url = window.location.href;
  console.log("lock clicked");

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let url = tabs[0].url;
    // use `url` here inside the callback because it's asynchronous!
    console.log(url);
    lock(url);
  });
}

// // button1 click event listener to apply function
// buttonLock.addEventListener("click", function() {
//     // your function code here
//     // get url and call lock with it
//     const url = window.location.href;
//     console.log("lock clicked")
//     console.log(url);
//     // lock(url)
// });

// [
//   {
//     id: 1,
//     priority: 1,
//     action: { type: "block" },
//     condition: { urlFilter: "netflix.com", resourceTypes: ["main_frame"] },
//   },
// ];

/**
 * Locks the url given by appending a new rule
 * @param {string} url- The URL to be locked
 */
async function lock(url) {
  // error handling:
  // what if already blocked? shouldn't happen but.

  // get existing rules

  // create new rule

  

  // newRules = oldRules + new rule
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  console.log(oldRules)
  console.log(oldRules.length)

  const new_rule = [{
    id: oldRules.length + 1,
    priority: 1,
    action: { type: "block" },
    condition: { urlFilter: url, resourceTypes: ["main_frame"] },
  }];

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [],
    // addRules: newRules,
    addRules: new_rule,
  });
  console.log("done")
}

/**
 * Unlocks the url given by removing it from the ruleset
 * @param {string} url- The URL to be unlocked
 */
function unlock(url) {
  // error handling:
  // what if no rules?

  let toRemove;

  for (const rule of rules) {
    // find rule
    toRemove = rule.id;
  }

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [toRemove],
    addRules: [],
  });
}
