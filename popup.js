// waitForElement helper function
const waitForElement = async (selector) => {
  while (document.querySelector(selector) === null) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return document.querySelector(selector);
};

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if (request.message === "allocations_updated") {
//       // TODO
//     }
//   }
// );

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
waitForElement("#experiment-section").then(function (experimentList) {
  chrome.storage.sync.get(["evolv:allocations"], function (result) {
    let allocations = result["evolv:allocations"];
    if (allocations && allocations.length > 0) {
      [].forEach.call(allocations, function (allocation) {
        experimentList.insertAdjacentHTML(
          "beforeend",
          `
            <div class="experiment_row hide-info">
              <ul>
                <li><p><b>Experiment ID:</b> <span class="eid">${allocation.eid}</span></p></li>
                <li>
                  <p><b>Ordinal:</b> <span class="ordinal">${allocation.ordinal}</span></p>
                  <div class="image-wrapper">
                    <img class="expand" src="https://img.icons8.com/ios/50/000000/expand-arrow.png"/>
                    <img class="collapse" src="https://img.icons8.com/ios/50/000000/collapse-arrow.png"/>
                  </div>
                </li>
              </ul>
              <ul class="additional_info">
                <li><p><b>UID:</b> <span class="conf_uid">${allocation.uid}</span></p></li>
                <li><p><b>CID:</b> <span class="conf_cid">${allocation.cid}</span></p></li>
                <li><p><b>Group ID:</b> <span class="conf_group_id">${allocation.group_id}</span></p></li>
                <li><p><b>Excluded:</b> <span class="conf_excluded">${allocation.excluded}</span></p></li>
              </ul>
            </div>
          `
        );
      });
    }

    let expandButtonWrapperElements = document.querySelectorAll('.image-wrapper');
    [].forEach.call(expandButtonWrapperElements, function (button) {
      button.addEventListener('click', function (e) {
        let experimentRowEl = e.target.closest('.experiment_row');    
        experimentRowEl.classList.contains('hide-info') ? experimentRowEl.classList.remove('hide-info') : experimentRowEl.classList.add('hide-info');
      });
    });
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