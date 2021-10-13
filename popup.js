const removeAllocations = () => {
  let experimentList = document.getElementById('experiment-section')
  if (experimentList) experimentList.innerHTML = "";
};

window.dispatchEvent(new Event('run_evotools_content_script'));

const getConfirmationCIDs = (confirmations) => {
  console.log('hey brian confirmations', confirmations);
  let confirmationCIDs = [];
  if (confirmations !== "(empty)") {
    [].forEach.call(JSON.parse(confirmations), function (confirmation) {
      let cid = confirmation.cid;
      confirmationCIDs.push(cid);
    });
  }
  return confirmationCIDs;
};
const waitForElement = async (selector) => {
  while (document.querySelector(selector) === null) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return document.querySelector(selector);
};

const setUidValue = () => {
  waitForElement("#evolv_uid").then(function (uidInput) {
    chrome.storage.sync.get(["evolv:uid"], function (resultUid) {
      uidInput.textContent = resultUid["evolv:uid"] || '(not set)';
    });
  });
};

const setSidValue = () => {
  waitForElement("#evolv_sid").then(function (sidInput) {
    chrome.storage.sync.get(["evolv:sid"], function (resultSid) {
      const sidValue = resultSid["evolv:sid"];
      sidInput.textContent = sidValue || '(not set)';
    });
  });
};

const setEnvironmentValue = () => {
  waitForElement("#envID").then(function (envInput) {
    chrome.storage.sync.get(["evolv:envId"], function (resultEnvId) {
      const environmentValue = resultEnvId["evolv:envId"]
      envInput.textContent = environmentValue || '(not set)';
    });
  });
};

const handleExperimentRowClicks = () => {
  let experimentRows = document.querySelectorAll('.experiment_row ul li');
  [].forEach.call(experimentRows, function (rowLi) {
    rowLi.addEventListener('click', function (e) {
      let experimentRowEl = e.target.closest('.experiment_row');
      if (experimentRowEl)
        experimentRowEl.classList.contains('hide-info') ? experimentRowEl.classList.remove('hide-info') : experimentRowEl.classList.add('hide-info');
    });
  });
};

const handleSettingsButtonClicks = () => {
  // Listen for clicks to the Options button
  waitForElement("button.settings-icon").then(function (settingsButton) {
    settingsButton.addEventListener("click", function () {
      chrome.tabs.create({
        url: "settings.html",
      });
    });
  });
};

const setAllocationsAndConfirmations = () => {
  waitForElement("#experiment-section").then(function (experimentList) {
    chrome.storage.sync.get(["evolv:allocations"], function (resultAllocations) {
      let allocationsString = resultAllocations["evolv:allocations"];
      if (allocationsString !== "(empty)") {
        let allocationsJSON = JSON.parse(allocationsString);
        chrome.storage.sync.get(["evolv:confirmations"], function (resultConfirmations) {
          let confirmationCIDs = getConfirmationCIDs(resultConfirmations["evolv:confirmations"]);
          if (allocationsJSON && allocationsJSON.length > 0) {
            [].forEach.call(allocationsJSON, function (allocation) {
                experimentList.insertAdjacentHTML(
                  "beforeend", `
                    <div class="experiment_row hide-info ${confirmationCIDs.includes(allocation.cid) ? 'confirmed': ''}" data-allocation="${allocation.cid}">
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

          handleExperimentRowClicks();
        });
      } else {
        experimentList.insertAdjacentHTML(
          "beforeend", `
            <div class="experiment_row hide-info" data-allocation="none">
              <p style="padding-left: 10px">No allocations</p>
            </div>
          `
        );
      }
    });
  });
};

let run = () => {
  removeAllocations();
  setUidValue();
  setSidValue();
  setEnvironmentValue();
  setAllocationsAndConfirmations();
  handleSettingsButtonClicks();
}

run();

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "confirmations_updated") {
      removeAllocations();
      run();
    } else if (request.message === "clear_allocations") {
      removeAllocations();
    }
  }
);
