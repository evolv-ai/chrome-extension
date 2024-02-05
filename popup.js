let remoteContext = {};
let environmentId = '';
let experimentCandidates = new Map;
let evolvUserId = '';
let usePreviewId = false;

const waitForElement = async (selector, timeout = 5000) => {
  const startTime = Date.now();

  while (document.querySelector(selector) === null) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for element with selector: ${selector}`);
    }

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

const setEnvironmentValue = () => {
  waitForElement("#envID").then(function (envInput) {
      envInput.textContent = environmentId || '(not set)';
  });
};

const handleExperimentRowClicks = () => {
  waitForElement('.experiment-title-bar').then(function () {
    let experimentRows = document.querySelectorAll('.experiment-title-bar');

    const clickAction = function (e) {
      let experimentRowEl = e.target.closest('.experiment_row');
      let candidateSelect = e.target.closest('.candidate-select');
      if (experimentRowEl && !candidateSelect) {
        experimentRowEl.classList.contains('hide-info') ? experimentRowEl.classList.remove('hide-info') : experimentRowEl.classList.add('hide-info');
      }
    }

    Array.prototype.forEach.call(experimentRows, function (titleBar) {
      if(!titleBar.classList.contains('visited')) {

        titleBar.classList.add('visited');
        titleBar.addEventListener('click', clickAction);
      }
    });
  });
};

const handleSettingsButtonClicks = () => {
  waitForElement("button.settings-icon").then(function (settingsButton) {
    settingsButton.addEventListener("click", function () {
      chrome.tabs.create({
        url: "settings.html",
      });
    });
  });
};

const setAllocationsAndConfirmations = () => {
  if (remoteContext && experimentCandidates.size > 0 ) {
    const allocations = remoteContext.experiments.allocations;
    const confirmations = remoteContext.experiments.confirmations;
    const experimentNames = remoteContext.experimentNames;

    let confirmationCIDs = [];
    if (confirmations) {
      confirmationCIDs = getConfirmationCIDs(confirmations);
    }

    if (allocations.length > 0) {
      allocations.sort((a, b) => {
        const eidA = a.eid;
        const eidB = b.eid;

        const nameA = experimentNames[eidA];
        const nameB = experimentNames[eidB];

        const isConfirmedA = confirmationCIDs.includes(a.cid);
        const isConfirmedB = confirmationCIDs.includes(b.cid);

        const excludedA = a.excluded;
        const excludedB = b.excluded;

        if (!excludedA && excludedB) {
          return -1;
        } else if (excludedA && !excludedB) {
          return 1;
        }

        if (isConfirmedA && !isConfirmedB) {
          return -1;
        } else if (!isConfirmedA && isConfirmedB) {
          return 1;
        }

        return nameA.localeCompare(nameB);

      });

      for (let i = 0; i < allocations.length; i++) {
        const allocation = allocations[i];
        const excluded = allocation.excluded;

        waitForElement("#experiment-section").then(function (experimentList) {
          const expName = experimentNames[allocation.eid] ? experimentNames[allocation.eid] : allocation.eid;
          const candidateList = experimentCandidates.get(allocation.eid);
          const combinationLabel = getCombinationLabel(candidateList, allocation.ordinal);

          if (!document.querySelector(`.experiment_row[data-allocation="${allocation.eid}"]`) && !!experimentList) {
              experimentList.insertAdjacentHTML(
                "beforeend", `
                <div class="experiment_row hide-info" data-allocation="${allocation.eid}">
                  <div class="experiment-title-bar">
                    <p>
                      <strong class="e-name">${expName}</strong>
                    </p>
                    <div class="combination-container">
                      ${excluded
                        ? '<span class="excluded">Excluded</span>'
                        : `
                            <select name="candidate-select" class="candidate-select" id="select-${allocation.eid}">
                              <option value="${allocation.cid}" selected>${combinationLabel}</option>
                            </select>
                          `
                }
                      <div class="tooltip-arrow">
                        <div class="tooltip">
                          <span>${
                  confirmationCIDs.includes(allocation.cid)
                    ? `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                            <path d="M10.1 4.4L8.60001 6L11.5 8.9H0.100006V11.1H11.4L8.60001 14L10.2 15.6L15.8 10L10.1 4.4ZM18.1 17.8H9.20001V20H18.1C19.3 20 20.3 19 20.3 17.8V2.2C20.3 1 19.3 0 18.1 0H9.20001V2.2H18.1V17.8Z" fill="#71C97E"/>
                            </svg>`
                    : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                            <path d="M17.1 0.900002H8.2C7 0.900002 6 1.9 6 3.2V3.4C6.3 3.4 6.6 3.3 6.9 3.3C7.3 3.3 7.8 3.3 8.2 3.4V3.2H17.1V18.8H8.2V18.5C7.8 18.6 7.4 18.6 6.9 18.6C6.6 18.6 6.3 18.6 6 18.5V18.7C6 19.9 7 20.9 8.2 20.9H17.1C18.3 20.9 19.3 19.9 19.3 18.7V3.2C19.3 1.9 18.3 0.900002 17.1 0.900002Z" fill="#777777"/>
                            <path d="M13.4 10.9C13.4 7.3 10.5 4.4 6.89999 4.4C3.29999 4.4 0.399994 7.3 0.399994 10.9C0.399994 14.5 3.29999 17.4 6.89999 17.4C10.5 17.4 13.4 14.5 13.4 10.9ZM12.1 10.9C12.1 13.8 9.79999 16.1 6.89999 16.1C5.79999 16.1 4.89999 15.8 3.99999 15.2L11.2 8C11.8 8.9 12.1 9.9 12.1 10.9ZM6.89999 5.7C7.89999 5.7 8.79999 6 9.59999 6.5L2.49999 13.6C1.99999 12.8 1.69999 11.9 1.69999 10.9C1.69999 8.1 4.09999 5.7 6.89999 5.7Z" fill="#777777"/>
                            </svg>`
                }</span>
                          <div class="tooltip-message">
                            ${
                  confirmationCIDs.includes(allocation.cid)
                    ? 'This page is an entry point of this project'
                    : 'This page is not an entry point for this project'
                }
                          </div>
                        </div>
                        <div class="arrow-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="9" viewBox="0 0 12 9" fill="none">
                            <path d="M10.6 0.624994L12 2.02499L6 8.02499L5.24537e-07 2.02499L1.4 0.624993L6 5.22499L10.6 0.624994Z" fill="#666666"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ul class="additional_info">

                    <li><p><b>uid:</b> <span class="conf_uid">${allocation.uid}</span></p></li>
                    <li><p><b>eid:</b> <span class="conf_eid">${allocation.eid}</span></p></li>
                    <li><p><b>cid:</b> <span class="conf_cid">${allocation.cid}</span></p></li>
                    <li><p><b>group_id:</b> <span class="conf_group_id">${allocation.group_id || '-'}</span></p></li>
                    <li><p><b>excluded:</b> <span class="conf_excluded">${allocation.excluded}</span></p></li>
                    <li><p><b>ordinal:</b> <span class="conf_excluded">${allocation.ordinal === undefined ? '-' : allocation.ordinal}</span></p></li>
                  </ul>
                </div>
              `
              );
            }

          if (candidateList.length > 1 && !allocation.excluded) {
            waitForElement(`#select-${allocation.eid}`).then(function (select) {
              select.innerHTML = candidateList.map(candidate => {
                const combinationLabel = getCombinationLabel(candidateList, candidate.ordinal);

                return `<option value="${candidate.id}" ${candidate.id === allocation.cid ? 'selected' : ''}>${combinationLabel}</option>`
              }).join('');

              select.addEventListener('change', function (e) {
                const cid = e.target.value;
                setPreviewCid(cid);
              });
            });
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
      waitForElement("#experiment-section").then(function (experimentList) {
        if (!!experimentList && !noAllocationsEl) {
          experimentList.insertAdjacentHTML("beforeend", `<div class="experiment_row hide-info" data-allocation="none"><p style="padding-left: 10px">No allocations</p></div>`);
        }
      });
    }
  }
};

const getCombinationLabel = (candidates, ordinal) => {
  const isControl = ordinal === candidates[0].ordinal;

  return `Combination ${ordinal}${isControl ? ' (C)' : ''}`;
}

const setPreviewCid = (cid) => {
  sendMessage({ message: 'set_preview_cid', cid });
  window.close();
}

const clearPreviewCid = () => {
  sendMessage({ message: 'clear_preview_cid' });
  window.close();
}

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

const handleClearSelectionClicks = async () => {
  waitForElement('#clear-selection').then(function (clear) {
    usePreviewId ? clear.classList.add('active') : clear.classList.remove('active');

    clear.addEventListener('click', function () {
      clearPreviewCid();
    });
  });
}

const setBlockExecutionStatus = (blockExecutionValue) => {
  waitForElement("#block-execution-toggle input").then(function (toggleInput) {
    blockExecutionValue
      ? toggleInput.checked = false
      : toggleInput.checked = true;

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

const timeFormatter = new Intl.RelativeTimeFormat(undefined, {
  numeric: "always",
  style: "narrow"
})

const DIVISIONS = [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" }
]

function formatTimeAgo(timestamp) {
  let duration = (timestamp - Date.now()) / 1000;

  for (let i = 0; i < DIVISIONS.length; i++) {
    const division = DIVISIONS[i]

    if (Math.abs(duration) < division.amount) {
      return timeFormatter.format(Math.round(duration), division.name)
    }

    duration /= division.amount
  }

  return '';
}

const setEvents = () => {
  if (remoteContext) {
    const events = remoteContext.events;

    if (events && events.length) {
      for (let i = events.length; i >= 0; i--) {
        const event = events[i];

        waitForElement("#events-section").then(function (eventsList) {
          const eventName = event.type;
          const eventTime = new Date(event.timestamp).toLocaleTimeString();
          const eventUniqueKey = `${eventName}.${event.timestamp}`;
          const timeSince = formatTimeAgo(event.timestamp);

          if (!document.querySelector(`event-row[data-event-key="${eventUniqueKey}"]`) && !!eventsList) {
            eventsList.insertAdjacentHTML(
              "beforeend", `
                <div class="event-row" data-event-key="${eventUniqueKey}">
                    <div class="event-name">${eventName}</div>
                    <div class="timestamp-container">
                      <div class="event-timestamp">${eventTime}</div>
                      <div class="time-since">(${timeSince})</div>
                    </div>
                </div>
              `
            );
          }
        });
      }

      const noEventsEl = document.querySelector('.event-row[data-event-key="none"]');

      if (noEventsEl) {
        noEventsEl.remove();
      }

    } else {
      const noEventsEl = document.querySelector('.event-row[data-event-key="none"]');
      waitForElement("#events-section").then(function (eventsList) {
        if (!!eventsList && !noEventsEl) {
          eventsList.insertAdjacentHTML("beforeend", `<div class="event-row" data-event-key="none"><p>No events</p></div>`);
        }
      });
    }
  }
};

const setConfig = async () => {
  if (environmentId) {
    try {
      await chrome.runtime.sendMessage({type: 'evolv:environmentConfig', envId: environmentId}, response => {
        if (response.data) {
          const experiments = response.data._experiments;

          if (experiments && experiments.length) {
            for (let i = 0; i < experiments.length; i++) {
              experimentCandidates.set(experiments[i].id, experiments[i]._candidates);
            }
          }
        } else {
          console.error("Fetch environment config failed: ", response.error);
        }

        setAllocationsAndConfirmations();
      });
    } catch (error) {
      console.error("Fetch environment config failed: ", error);
    }
  }

  return true;
}

let run = () => {
  sendMessage({ message: 'initialize_evoTools' });
  handleCopyButtonClicks();
}

setInterval(() => {
  // let contentjs know popup is open. it prevents sending message to popup when it's closed.
  sendMessage({ message: 'ping_content_script' });
}, 1000)

chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.message) {
    case 'evolv:remoteContext':
      setAllocationsAndConfirmations();
      break;

    case 'evolv:blockExecution':
      setBlockExecutionStatus(msg.data);
      break;

    case 'evolv:initialData':
      remoteContext = msg.data.remoteContext;
      environmentId = msg.data.envID;
      evolvUserId = msg.data.uid;
      usePreviewId = !!msg.data.previewCid;
      handleClearSelectionClicks();
      setEnvironmentValue();
      setBlockExecutionStatus(msg.data.blockExecution);
      setUidValue(msg.data.uid);
      setConfig();
      setEvents();
      break;
  }
});

run();
