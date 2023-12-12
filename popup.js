let remoteContext = {};
let contentJsLoaded = true;

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
  waitForElement('.experiment-title-bar').then(function () {
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
  if (remoteContext && remoteContext.experiments && remoteContext.experiments.allocations) {
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
        waitForElement("#experiment-section").then(function (experimentList) {
          const expName = experimentNames[allocation.eid] ? experimentNames[allocation.eid] : allocation.eid
          if (!document.querySelector(`.experiment_row[data-allocation="${allocation.cid}"]`) && !!experimentList) {
            experimentList.insertAdjacentHTML(
              "beforeend", `
                <div class="experiment_row hide-info" data-allocation="${allocation.cid}">
                  <ul class="experiment-title-bar">
                    <li>
                      <b class="e-name">${expName}</b>
                    </li>
                    <li class="combination">
                      <p><span>Combination:</span> <span class="ordinal">${allocation.ordinal === undefined ? '-' : allocation.ordinal}</span></p>
                    </li>
                    <li>
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
                    </li>
                  </ul>
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
          console.log(event.name);
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

let run = () => {
  handleCopyButtonClicks();
  sendMessage({ message: 'initialize_evoTools' });
}

setInterval(() => {
  // let contentjs know popup is open. it prevents sending message to popup when it's closed.
  sendMessage({ message: 'ping_content_script' });
}, 1000)

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
      setUidValue(msg.data.uid);
      setEvents();
  }
});

run();
