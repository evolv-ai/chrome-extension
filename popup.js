let remoteContext = {};

const waitForElement = async (selector) => {
  while (document.querySelector(selector) === null) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return document.querySelector(selector);
};

const sendMessage = function (message) {
  chrome.tabs.query({
    currentWindow: true,
    active: true
  }, function (tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, message);
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

const setUidValue = (uid) => {
  waitForElement("#evolv_uid").then(function (uidInput) {
    uidInput.textContent = uid || '(not set)';
  });
};

const setEnvironmentValue = (environmentValue) => {
  waitForElement("#envID").then(function (envInput) {
      envInput.textContent = environmentValue || '(not set)';
  });
};

const handleExperimentRowClicks = () => {
  let experimentRows = document.querySelectorAll('.experiment-title-bar');

  const clickAction = function (e) {
    let experimentRowEl = e.target.closest('.experiment_row');
    if (experimentRowEl) {
      experimentRowEl.classList.contains('hide-info') ? experimentRowEl.classList.remove('hide-info') : experimentRowEl.classList.add('hide-info');
    }
  }

  Array.prototype.forEach.call(experimentRows, function (titleBar) {
    if(!titleBar.classList.contains('visited')) {
      titleBar.classList.add('visited');
      titleBar.addEventListener('click', clickAction);
    }
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

const setAllocationsAndConfirmations = () => {
  if (remoteContext && remoteContext.experiments && remoteContext.experiments.allocations) {
    // setQaAudience(remoteContext);

    const allocations = remoteContext.experiments.allocations;
    const confirmations = remoteContext.experiments.confirmations;
    const experimentNames = remoteContext.experimentNames;

    let confirmationCIDs = [];
    if (confirmations) {
      confirmationCIDs = getConfirmationCIDs(confirmations);
    }

    if (allocations.length > 0) {
      for (let i = 0; i < allocations.length; i++) {
        const allocation = allocations[i];
        // TODO figure out a way to get these values
        // const organizationId = 'ca93a6b80d';
        // const projectId = '92d0fe50ce';
        // const experimentName = 'Opt 11 Prospect Gridwall';

        // const managerExperimentURL = `https://app.evolv.ai/organizations/${organizationId}/deploy/${environmentId}/projects/${projectId}`;
        // const managerCombinationURL = `https://app.evolv.ai/${organizationId}/deploy/${environmentId}/projects/${projectId}/combinations/${allocation.cid}/view`;
        // <!-- <li><p><a href="${managerExperimentURL}" target="_blank"><b>View Experiment in Evolv Manager</b></a></p></li> -->
        // <!-- <li><p><a href="${managerCombinationURL}" target="_blank"><b>View Combination in Evolv Manager</b></a></p></li> -->


        waitForElement("#experiment-section").then(function (experimentList) {
          // check to make sure the experiment row doesn't already exist
          if (!document.querySelector(`.experiment_row[data-allocation="${allocation.cid}"]`)) {
            experimentList.insertAdjacentHTML(
              "beforeend", `
                <div class="experiment_row hide-info" data-allocation="${allocation.cid}">
                  <ul class="experiment-title-bar">
                    <li>
                      ${
                        confirmationCIDs.includes(allocation.cid)
                        ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="11" viewBox="0 0 14 11" fill="none">
                        <path d="M4.95834 11L0.208336 6.24999L1.39584 5.06249L4.95834 8.62499L12.6042 0.979156L13.7917 2.16666L4.95834 11Z" fill="#57C568"/>
                      </svg>`
                        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 17.3333C7.84722 17.3333 6.76389 17.1144 5.75 16.6767C4.73611 16.2394 3.85416 15.6458 3.10416 14.8958C2.35416 14.1458 1.76055 13.2639 1.32333 12.25C0.885553 11.2361 0.666664 10.1528 0.666664 9C0.666664 7.84722 0.885553 6.76389 1.32333 5.75C1.76055 4.73611 2.35416 3.85416 3.10416 3.10416C3.85416 2.35416 4.73611 1.76028 5.75 1.3225C6.76389 0.885275 7.84722 0.666664 9 0.666664C10.1528 0.666664 11.2361 0.885275 12.25 1.3225C13.2639 1.76028 14.1458 2.35416 14.8958 3.10416C15.6458 3.85416 16.2394 4.73611 16.6767 5.75C17.1144 6.76389 17.3333 7.84722 17.3333 9C17.3333 10.1528 17.1144 11.2361 16.6767 12.25C16.2394 13.2639 15.6458 14.1458 14.8958 14.8958C14.1458 15.6458 13.2639 16.2394 12.25 16.6767C11.2361 17.1144 10.1528 17.3333 9 17.3333ZM9 15.6667C10.8611 15.6667 12.4375 15.0208 13.7292 13.7292C15.0208 12.4375 15.6667 10.8611 15.6667 9C15.6667 8.25 15.545 7.52777 15.3017 6.83333C15.0589 6.13889 14.7083 5.5 14.25 4.91666L4.91666 14.25C5.5 14.7083 6.13889 15.0589 6.83333 15.3017C7.52777 15.545 8.25 15.6667 9 15.6667ZM3.75 13.0833L13.0833 3.75C12.5 3.29166 11.8611 2.94111 11.1667 2.69833C10.4722 2.455 9.75 2.33333 9 2.33333C7.13889 2.33333 5.5625 2.97916 4.27083 4.27083C2.97916 5.5625 2.33333 7.13889 2.33333 9C2.33333 9.75 2.455 10.4722 2.69833 11.1667C2.94111 11.8611 3.29166 12.5 3.75 13.0833Z" fill="#DD0000"/>
                        </svg>`
                      }
                      <b class="e-name">${experimentNames[allocation.eid]}</b></li>
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
                    <li><p><b>UID:</b> <span class="conf_uid">${allocation.eid}</span></p></li>
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

      const noAllocationsEl = document.querySelector('.experiment_row[data-allocation="none"]');
      if (noAllocationsEl) {
        noAllocationsEl.remove();
      }

      handleExperimentRowClicks();
    } else {
      const noAllocationsEl = document.querySelector('.experiment_row[data-allocation="none"]');
      if (experimentList && !noAllocationsEl) {
        experimentList.insertAdjacentHTML("beforeend", `<div class="experiment_row hide-info" data-allocation="none"><p style="padding-left: 10px">No allocations</p></div>`);
      }
    }
  }
};

const handleCopyButtonClicks = () => {
  waitForElement('#copy-debug-info').then(function (copyButton) {
    copyButton.addEventListener('click', function () {
      const currentInnerHTML = copyButton.innerHTML;
      // add remoteContext string to the clipboard
      var data = [new ClipboardItem({
        "text/plain": new Blob([JSON.stringify(remoteContext)], {
          type: "text/plain"
        })
      })];
      navigator.clipboard.write(data);

      copyButton.classList.add('copied');
      copyButton.textContent = "Copied!";

      setTimeout(function () {
        copyButton.classList.remove('copied');
        copyButton.innerHTML = currentInnerHTML;
      }, 1500);
    });
  });
};

const setBlockExecutionStatus = (blockExecutionValue) => {
  waitForElement("#block-execution-toggle input").then(function (toggleInput) {
    if (blockExecutionValue) {
      toggleInput.checked = false;
    } else {
      toggleInput.checked = true;
    }

    toggleInput.addEventListener('click', function (e) {
      removeAllocations();
      if (!toggleInput.checked) {
        sendMessage({ message: 'disable_evolv' });
        e.target.parentElement.previousElementSibling.textContent = 'Snippet Disabled';
      } else {
        sendMessage({ message: 'enable_evolv' });
        e.target.parentElement.previousElementSibling.textContent = 'Snippet Enabled';
      }
    });
  });
};

let run = () => {
  // handleSettingsButtonClicks();
  handleCopyButtonClicks();
  sendMessage({ message: 'initialize_evoTools' });
}

chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.message) {
    case 'evoTools:remoteContext':
      remoteContext = msg.data;
      setAllocationsAndConfirmations();
      break;
    case 'evolv:blockExecution':
      setBlockExecutionStatus(msg.data);
      break;
    case 'evolv:envId':
      setEnvironmentValue(msg.data);
      break;
    case 'evolv:initialData':
      remoteContext = msg.data.remoteContext;
      setAllocationsAndConfirmations();
      setBlockExecutionStatus(msg.data.blockExecution);
      setEnvironmentValue(msg.data.envID);
      setUidValue(msg.data.uid)

  }
});


run();
