const waitForElement = async (selector) => {
  while (document.querySelector(selector) === null) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return document.querySelector(selector);
};

const sendMessage = function (message, data) {
  chrome.tabs.query({
    currentWindow: true,
    active: true
  }, function (tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {
      message,
      data
    });
  });
};

const removeAllocations = () => {
  let experimentSection = document.getElementById('experiment-section')
  let noAllocationsEl = document.querySelector('.experiment_row[data-allocation="none"]');
  if (experimentSection && !noAllocationsEl)
    experimentSection.innerHTML = `<div class="experiment_row hide-info" data-allocation="none"><p style="padding-left: 10px">No allocations</p></div>`;
};

const getConfirmationCIDs = (confirmations) => {
  if (!confirmations) return null;

  let confirmationCIDs = [];
  Array.prototype.forEach.call(confirmations, function (confirmation) {
    let cid = confirmation.cid;
    confirmationCIDs.push(cid);
  });
  return confirmationCIDs;
};

const setUidValue = () => {
  waitForElement("#evolv_uid").then(function (uidInput) {
    chrome.storage.sync.get(["evolv:uid"], function (resultUid) {
      uidInput.textContent = resultUid["evolv:uid"] || '(not set)';
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
  let experimentRows = document.querySelectorAll('.experiment-title-bar');
  Array.prototype.forEach.call(experimentRows, function (titleBar) {
    titleBar.addEventListener('click', function (e) {
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


//
// FYI - this doesn't currently get set in the remoteContext as you might expect 
//
// const setQaAudienceEnabled = (qaAudienceEnabled) => {
//   let qaInput = document.querySelector('#evolv_qaAudienceEnabled');
//   qaInput.textContent = qaAudienceEnabled;
// };
// const setQaAudience = remoteContext => {\
//   if (remoteContext.config) {
//     let qaAudienceEnabled = remoteContext.config.qaAudienceEnabled;
//     setQaAudienceEnabled(!!qaAudienceEnabled);
//   }
// };

const renderExperiment = (remoteContext) => {
  if (remoteContext && remoteContext.experiments && remoteContext.experiments.allocations) {
    // setQaAudience(remoteContext);

    let allocations = remoteContext.experiments.allocations;
    let confirmations = remoteContext.experiments.confirmations;

    let confirmationCIDs = [];
    if (confirmations) {
      confirmationCIDs = getConfirmationCIDs(confirmations);
    }

    if (allocations.length > 0) {
      for (let i = 0; i < allocations.length; i++) {
        let allocation = allocations[i];
        // TODO figure out a way to get these values
        // let organizationId = 'ca93a6b80d';
        // let projectId = '92d0fe50ce';
        // let experimentName = 'Opt 11 Prospect Gridwall';

        // let managerExperimentURL = `https://app.evolv.ai/organizations/${organizationId}/deploy/${environmentId}/projects/${projectId}`;
        // let managerCombinationURL = `https://app.evolv.ai/${organizationId}/deploy/${environmentId}/projects/${projectId}/combinations/${allocation.cid}/view`;
        // <!-- <li><p><a href="${managerExperimentURL}" target="_blank"><b>View Experiment in Evolv Manager</b></a></p></li> -->
        // <!-- <li><p><a href="${managerCombinationURL}" target="_blank"><b>View Combination in Evolv Manager</b></a></p></li> -->


        waitForElement("#experiment-section").then(function (experimentList) {
          // check to make sure the experiment row doesn't already exist
          if (!document.querySelector(`.experiment_row[data-allocation="${allocation.cid}"]`)) {
            experimentList.insertAdjacentHTML(
              "beforeend", `
                <div class="experiment_row hide-info ${confirmationCIDs.includes(allocation.cid) ? 'confirmed': ''}" data-allocation="${allocation.cid}">
                  <ul class="experiment-title-bar">
                    <li><p><b>Experiment ID:</b> <span class="eid">${allocation.eid}</span></p></li>
                    <li>
                      <p><b>Combination:</b> <span class="ordinal">${allocation.ordinal}</span></p>
                      <div class="arrow-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="9" viewBox="0 0 12 9" fill="none">
                          <path d="M10.6 0.624994L12 2.02499L6 8.02499L5.24537e-07 2.02499L1.4 0.624993L6 5.22499L10.6 0.624994Z" fill="#666666"/>
                        </svg>
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
          }
        });
      }

      let noAllocationsEl = document.querySelector('.experiment_row[data-allocation="none"]');
      if (noAllocationsEl) {
        noAllocationsEl.remove();
      }

      handleExperimentRowClicks();
    } else {
      let noAllocationsEl = document.querySelector('.experiment_row[data-allocation="none"]');
      if (experimentList && !noAllocationsEl) {
        experimentList.insertAdjacentHTML("beforeend", `<div class="experiment_row hide-info" data-allocation="none"><p style="padding-left: 10px">No allocations</p></div>`);
      }
    }
  }
}

const setAllocationsAndConfirmations = () => {
  chrome.storage.sync.get(["evoTools:remoteContext"], function (rc) {
    remoteContext = rc["evoTools:remoteContext"];
    renderExperiment(remoteContext);
  });
};

const handleDebugButtonClicks = () => {
  waitForElement('#copy-debug-info').then(function (debugButton) {
    debugButton.addEventListener('click', function () {
      // add remoteContext string to the clipboard
      var data = [new ClipboardItem({
        "text/plain": new Blob([JSON.stringify(remoteContext)], {
          type: "text/plain"
        })
      })];
      navigator.clipboard.write(data);

      debugButton.classList.add('copied');
      debugButton.textContent = "Copied!";

      setTimeout(function () {
        debugButton.classList.remove('copied');
        debugButton.textContent = "Copy Debug Info";
      }, 1500);
    });
  });
};

const setBlockExecutionStatus = () => {
  waitForElement("#block-execution-toggle input").then(function (toggleInput) {
    chrome.storage.sync.get('evolv:blockExecution', (res) => {
      const blockExecutionValue = res['evolv:blockExecution'];
      if (blockExecutionValue) {
        toggleInput.checked = false;
      } else {
        toggleInput.checked = true;
      }

      toggleInput.addEventListener('click', function (e) {
        removeAllocations();
        if (!toggleInput.checked) {
          sendMessage('disable_evolv');
          chrome.runtime.sendMessage({ message: 'resetStore' });
        } else {
          sendMessage('enable_evolv');
          setTimeout(() => { window.location.reload();}, 300);
        }
      });
    });
  });
};

let run = () => {
  setBlockExecutionStatus();
  setUidValue();
  setEnvironmentValue();
  setAllocationsAndConfirmations();
  // handleSettingsButtonClicks();
  handleDebugButtonClicks();
  sendMessage('update_popup');
}

run();

chrome.storage.onChanged.addListener((data, type) => {
  if(type === 'sync') {
    if (data['evoTools:remoteContext']) {
      renderExperiment(data['evoTools:remoteContext'].newValue);
    } else if (data['evolv:uid']) {
      setUidValue()
    } else if (data['evolv:envId']) {
      setEnvironmentValue()
    }

  }
})
