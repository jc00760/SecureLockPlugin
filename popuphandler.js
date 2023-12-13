/**
 * Locks the url given by appending a new rule
 * @param {string} url- The URL to be locked
 */
function lock(url) {
  // error handling:
  // what if already blocked? shouldn't happen but.

  // extract url

  // get existing rules

  // create new rule

  // newRules = oldRules + new rule

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [],
    addRules: newRules,
  });
}

/**
 * Unocks the url given by removing it from the ruleset
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
    addRules:[],
  });
}
