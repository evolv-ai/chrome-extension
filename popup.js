// tell contentScript.js to do its thing
chrome.tabs.query({
  currentWindow: true,
  active: true
}, function (tabs) {
  var activeTab = tabs[0];
  chrome.tabs.sendMessage(activeTab.id, {
    "message": "run_evotools_content_script"
  });
});

const removeAllocations = () => {
  let experimentList = document.getElementById('experiment-section')
  let noAllocationsEl = document.querySelector('.experiment_row[data-allocation="none"]');
  if (experimentList && !noAllocationsEl)
    experimentList.innerHTML = `
      <div class="experiment_row hide-info" data-allocation="none">
        <p style="padding-left: 10px">No allocations</p>
      </div>
    `;
};

const getConfirmationCIDs = (confirmations) => {
  console.log('hey brian confirmations', confirmations);
  let confirmationCIDs = [];
  console.log('hey brian confirmations', confirmations);

  if (confirmations !== "(empty)") {
    let confirmationsJSON = JSON.parse(confirmations);
    console.log('hey brian confirmationsJSON', confirmationsJSON);
    Array.prototype.forEach.call(confirmationsJSON, function (confirmation) {
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
  Array.prototype.forEach.call(experimentRows, function (rowLi) {
    rowLi.addEventListener('click', function (e) {
      let experimentRowEl = e.target.closest('.experiment_row');
      if (experimentRowEl) {
        experimentRowEl.classList.contains('hide-info') ? experimentRowEl.classList.remove('hide-info') : experimentRowEl.classList.add('hide-info');
      }
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
    chrome.storage.sync.get(["evolv:envId"], function (envId) {
      let environmentId = envId["evolv:envId"];

      chrome.storage.sync.get(["evolv:allocations"], function (resultAllocations) {
        let allocationsString = resultAllocations["evolv:allocations"];
        if (allocationsString !== "(empty)" && allocationsString !== "") {
          let allocationsJSON = JSON.parse(allocationsString);

          chrome.storage.sync.get(["evolv:confirmations"], function (resultConfirmations) {
            let confirmationCIDs = getConfirmationCIDs(resultConfirmations["evolv:confirmations"]);
            if (allocationsJSON && allocationsJSON.length > 0) {
              Array.prototype.forEach.call(allocationsJSON, function (allocation) {
                // console.log('hey brian allocation', allocation);

                // TODO figure out a way to get this value
                let organizationId = 'ca93a6b80d';

                // TODO figure out a way to get this value
                let projectId = '92d0fe50ce';

                // TODO figure out a way to get ALL OF THESE THINGS
                // let experimentName = 'Opt 11 Prospect Gridwall';
                // let experimentName = 'Opt 11 Prospect Gridwall';

                let managerExperimentURL = `https://app.evolv.ai/organizations/${organizationId}/deploy/${environmentId}/projects/${projectId}`;
                let managerCombinationURL = `https://app.evolv.ai/${organizationId}/deploy/${environmentId}/projects/${projectId}/combinations/${allocation.cid}/view`;

                // check to make sure the experiment row doesn't already exist
                if (!document.querySelector(`.experiment_row[data-allocation="${allocation.cid}"]`)) {
                  experimentList.insertAdjacentHTML(
                    "beforeend", `
                        <div class="experiment_row hide-info ${confirmationCIDs.includes(allocation.cid) ? 'confirmed': ''}" data-allocation="${allocation.cid}">
                          <ul>
                            
                            <li><p><b>Experiment ID:</b> <span class="eid">${allocation.eid}</span></p></li>
                            <li>
                              <p><b>Combination:</b> <span class="ordinal">${allocation.ordinal}</span></p>
                              <div class="image-wrapper">
                                <img class="expand" src="https://img.icons8.com/ios/50/000000/expand-arrow.png"/>
                                <img class="collapse" src="https://img.icons8.com/ios/50/000000/collapse-arrow.png"/>
                              </div>
                            </li>
                          </ul>
                          <ul class="additional_info">
                            <li><p><a href="${managerExperimentURL}" target="_blank"><b>View Experiment in Evolv Manager</b></a></p></li>
                            <li><p><a href="${managerCombinationURL}" target="_blank"><b>View Combination in Evolv Manager</b></a></p></li>
                            <li><p><b>UID:</b> <span class="conf_uid">${allocation.uid}</span></p></li>
                            <li><p><b>CID:</b> <span class="conf_cid">${allocation.cid}</span></p></li>
                            <li><p><b>Group ID:</b> <span class="conf_group_id">${allocation.group_id}</span></p></li>
                            <li><p><b>Excluded:</b> <span class="conf_excluded">${allocation.excluded}</span></p></li>
                          </ul>
                        </div>
                      `
                  );
                }
              });

              let noAllocationsEl = document.querySelector('.experiment_row[data-allocation="none"]');
              if (noAllocationsEl) {
                noAllocationsEl.remove();
              }

              handleExperimentRowClicks();
            }
          });
        } else {
          let noAllocationsEl = document.querySelector('.experiment_row[data-allocation="none"]');
          if (experimentList && !noAllocationsEl)
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
  });
};

let run = () => {
  setUidValue();
  setSidValue();
  setEnvironmentValue();
  setAllocationsAndConfirmations();
  handleSettingsButtonClicks();
}

// listen for contentScript.js to tell us that it has set up the data
// and we're ready to display it
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "confirmations_updated") {
      removeAllocations();
      run();
    } else if (request.message === "clear_data") {
      removeAllocations();
    }
  }
);