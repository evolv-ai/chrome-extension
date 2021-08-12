// waitForElement helper function
const waitForElement = async (selector) => {
  while (document.querySelector(selector) === null) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return document.querySelector(selector);
};

// Set the User ID
waitForElement("#evolv_uid").then(function (uidInput) {
  chrome.storage.sync.get(["evolv:uid"], function (result) {
    if (result["evolv:uid"]) uidInput.textContent = result["evolv:uid"];
  });
});

// Set the Session ID
waitForElement("#evolv_sid").then(function (sidInput) {
  chrome.storage.sync.get(["evolv:sid"], function (result) {
    if (result["evolv:sid"]) sidInput.textContent = result["evolv:sid"];
  });
});

// Set the Candidate Token
waitForElement("#evolv_candidate_token").then(function (candidateTokenInput) {
  chrome.storage.sync.get(["evolv:candidateToken"], function (result) {
    if (result["evolv:candidateToken"])
      candidateTokenInput.textContent = result["evolv:candidateToken"];
  });
});

// Set the Environment ID
waitForElement("#envID").then(function (envInput) {
  chrome.storage.sync.get(["envID"], function (result) {
    envInput.textContent = result["envID"];
  });
});

// Set the Allocations
waitForElement("#experiment-section ul").then(function (experimentList) {
  chrome.storage.sync.get(["evolv:allocations"], function (result) {
    let allocations = result["evolv:allocations"];

    if (allocations && allocations.length > 0) {
      [].forEach.call(allocations, function (allocation) {
        experimentList.insertAdjacentHTML(
          "afterbegin",
          `
          <li class="row">
            <p><b>Experiment ID:</b> <span class="eid">${allocation.eid}</span></p>
            <p><b>Ordinal:</b> <span class="ordinal">${allocation.ordinal}</span></p>
          </li>
        `
        );
      });
    }
  });
});

// Listen for clicks to the Options button
waitForElement("button.settings-icon").then(function (settingsButton) {
  settingsButton.addEventListener("click", function () {
    chrome.tabs.create({
      url: "settings.html",
    });
  });
});