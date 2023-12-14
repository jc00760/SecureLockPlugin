// Function to check lock status of current page
async function checkLockStatus() {
  // let locked_id = -1;
  // chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
  //   let url = tabs[0].url;
  //   const rules = await chrome.declarativeNetRequest.getDynamicRules();
  //   // const isLocked = rules.some((rule) => rule.condition.urlFilter === url);

  //   for (const rule of rules) {
  //     if (rule.condition.urlFilter === url) {
  //       locked_id = rule.id;
  //     }
  //   }
  //   updateButtonVisibility(locked_id > 0);
  // });
  // console.log(locked_id)
  // return locked_id;
  return new Promise((resolve) => {
    let locked_id = -1;
    chrome.tabs.query(
      { active: true, lastFocusedWindow: true },
      async (tabs) => {
        let url = tabs[0].url;
        const rules = await chrome.declarativeNetRequest.getDynamicRules();
        console.log(rules);

        for (const rule of rules) {
          if (rule.condition.urlFilter === url) {
            locked_id = rule.id;
          }
        }

        updateButtonVisibility(locked_id > 0);
        console.log(locked_id);
        resolve(locked_id);
      }
    );
  });
}

// HTML button elements
window.onload = function () {
  const buttonLock = document.getElementById("lock");
  const buttonUnlock = document.getElementById("unlock");

  // check lock status on load
  checkLockStatus().then((locked_id) => {
    // This callback will be executed when the Promise is resolved
    // The resolved value (locked_id) is passed as an argument to this callback
    console.log("Updated locked_id:", locked_id);
  });

  buttonLock.addEventListener("click", function () {
    toggleLock(true);
  });

  buttonUnlock.addEventListener("click", function () {
    toggleLock(false);
  });
};

function toggleLock(toLock) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let url = tabs[0].url;

    // if (checkLockStatus > 0) {
    if (toLock) {
      lock(url);
    } else {
      unlock();
    }
    updateButtonVisibility(!toLock);
    // updateButtonVisibility(!toLock).then(() => {
    //   chrome.tabs.reload();
    // });
    chrome.tabs.reload();
  });
}

// Function to update button visibility based on lock status
function updateButtonVisibility(isLocked) {
  const buttonLock = document.getElementById("lock");
  const buttonUnlock = document.getElementById("unlock");

  if (isLocked) {
    buttonLock.style.display = "none";
    buttonUnlock.style.display = "block";
  } else {
    buttonLock.style.display = "block";
    buttonUnlock.style.display = "none";
  }
}

/**
 * Locks the url given by appending a new rule
 * @param {string} url- The URL to be locked
 */
async function lock(url) {
  // error handling:
  // what if already blocked? shouldn't happen but.
  const locked_id = await checkLockStatus();

  if (locked_id > 0) {
    console.log("should not be seeing this");
    return;
  }

  // get existing rules
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  console.log(oldRules);
  console.log(oldRules.length);

  // create new rule
  const new_rule = [
    {
      id: oldRules.length + 1,
      priority: 1,
      action: { type: "block" },
      condition: { urlFilter: url, resourceTypes: ["main_frame"] },
    },
  ];

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [],
    // addRules: newRules,
    addRules: new_rule,
  });
  chrome.tabs.reload();

  console.log("locked");
}

/**
 * Unlocks the url given by removing it from the ruleset
 */
async function unlock() {
  // error handling:
  // what if no rules?
  const toRemove = await checkLockStatus();

  if (toRemove > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [toRemove],
      addRules: [],
    });
    chrome.tabs.reload();
    console.log("unlocked");
  }
}
