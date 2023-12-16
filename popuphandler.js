// Function to check lock status of current page
async function checkLockStatus() {
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

        updateFormVisibility(locked_id > 0);
        console.log(locked_id);
        resolve(locked_id);
      }
    );
  });
}

// checks if password has been made
async function getPassword() {
  return new Promise((resolve) => {
    let password = undefined;

    chrome.storage.sync.get("password", async (pass) => {
      password = pass.password;
      console.log(password);
      resolve(password);
    });
  });
}

// HTML button elements
window.onload = function () {
  const buttonLock = document.getElementById("lock");
  const creation_form = document.getElementById("passwordCreation");
  const password_form = document.getElementById("passwordForm");
  const removeButton = document.getElementById("removeall");

  // check lock status on load
  checkLockStatus().then((locked_id) => {
    // This callback will be executed when the Promise is resolved
    // The resolved value (locked_id) is passed as an argument to this callback
    if (locked_id == -1) chrome.tabs.reload();
    console.log("Updated locked_id:", locked_id);
  });

  removeButton.addEventListener("click", async () => {
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("inside remove all");
    console.log(oldRules.length);

    const allRules = [];

    for (const rule of oldRules) {
      allRules.push(rule.id);
    }

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: allRules,
      addRules: [],
    });
    alert("Removed all locks!")
    chrome.tabs.reload();
  });

  // first pw creation
  creation_form.addEventListener("submit", () => {
    const user_password = document.getElementById("pw-creation").value;
    chrome.storage.sync.set({ password: user_password }).then(() => {
      console.log("password set to", user_password);
      toggleLock(true);
    });
  });

  // checking pw when unlocking
  password_form.addEventListener("submit", () => {
    const user_password = document.getElementById("pw").value;
    console.log("inside passwordform");

    getPassword().then((password) => {
      if (password && password === user_password) {
        toggleLock(false);
      } else {
        alert("password incorrect");
      }
    });
  });

  buttonLock.addEventListener("click", function () {
    toggleLock(true);
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
    updateFormVisibility(!toLock);
  });
}

// Function to update button visibility based on lock status
function updateFormVisibility(isLocked) {
  const buttonLock = document.getElementById("lock");
  const creation_form = document.getElementById("passwordCreation");
  const password_form = document.getElementById("passwordForm");

  getPassword().then((password) => {
    // locked, only password form visible
    if (isLocked) {
      password_form.style.display = "block";
      password_form.style.hidden = "false";

      creation_form.style.display = "none";
      creation_form.style.hidden = "true";

      buttonLock.style.display = "none";
    } else if (!isLocked && password) {
      // unlocked and password exists, lock button visible
      password_form.style.display = "none";
      password_form.style.hidden = "true";
      creation_form.style.display = "none";
      creation_form.style.hidden = "true";

      buttonLock.style.display = "block";
    } else {
      // unlocked and no password, creation form visible
      password_form.style.display = "none";
      password_form.style.hidden = "true";

      creation_form.style.display = "block";
      creation_form.style.hidden = "false";

      buttonLock.style.display = "none";
    }
    console.log(password);
    // This callback will be executed when the Promise is resolved
    // The resolved value (locked_id) is passed as an argument to this callback
  });
}

/**
 * Locks the url given by appending a new rule
 * @param {string} url- The URL to be locked
 */
async function lock(url) {
  // error handling: what if already blocked? shouldn't happen but.
  const locked_id = await checkLockStatus();

  if (locked_id > 0) {
    console.log("should not be seeing this");
    return;
  }

  // get existing rules
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  console.log(oldRules);
  console.log(oldRules.length);

  console.log(url);
  // create new rule
  const new_rule = [
    {
      id: oldRules.length + 1,
      priority: 1,
      action: { 
        type: "block"

        // uncomment this part for redirect (stretch goal)
        // type: "redirect",
        // redirect: { url : "https://lockit-locked.glitch.me" } 
      },
      condition: { urlFilter: url, resourceTypes: ["main_frame"] },
    },
  ];

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [],
    addRules: new_rule,
  });
  chrome.tabs.reload();
  
  console.log("locked");
}

/**
 * Unlocks the url given by removing it from the ruleset
 */
async function unlock() {
  // error handling: what if no rules?
  const toRemove = await checkLockStatus();
  console.log("hihihihihihi");
  if (toRemove > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [toRemove],
      addRules: [],
    });
    console.log("unlocked");
  }
}
