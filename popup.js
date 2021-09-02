// waitForElement helper function
const waitForElement = async (selector) => {
  while (document.querySelector(selector) === null) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return document.querySelector(selector);
};

const getConfirmationCIDs = (confirmations) => {
  let confirmationCIDs = [];
  [].forEach.call(confirmations, function (confirmation) {
    let cid = confirmation.cid;
    confirmationCIDs.push(cid);
  });
  return confirmationCIDs;
};

const removeAllocations = () => {
  [].forEach.call(document.querySelectorAll('.experiment_row[data-allocation]'), function (allocation) {
    allocation.remove();
  });
};

function run() {
  // each time this file runs, we should clear all existing allocations and recreate them to prevent stale allocations from being shown
  removeAllocations();

  waitForElement("#evolv_uid").then(function (uidInput) {
    waitForElement("#evolv_sid").then(function (sidInput) {
      waitForElement("#envID").then(function (envInput) {
        waitForElement("#experiment-section").then(function (experimentList) {
          // Set the User ID
          chrome.storage.sync.get(["evolv:uid"], function (result) {
            const uid = result["evolv:uid"];
            if (result["evolv:uid"]) {
              uidInput.textContent = uid;
            }

            // Set the Session ID
            chrome.storage.sync.get(["evolv:sid"], function (resultSid) {
              const sid = resultSid["evolv:sid"];
              if (resultSid["evolv:sid"]) {
                sidInput.textContent = sid;

              }

              // Set the Environment ID
              chrome.storage.sync.get(["envID"], function (result) {
                const environment_id = result["envID"]
                envInput.textContent = environment_id;

                const allocationsURL = `https://participants.evolv.ai/v1/${environment_id}/allocations?uid=${uid}&sid=${sid}`;
                fetch(allocationsURL).then(response => response.body).then(rb => {
                  const reader = rb.getReader();

                  return new ReadableStream({
                    start(controller) {
                      // The following function handles each data chunk
                      function push() {
                        reader.read().then(({
                          done,
                          value
                        }) => {
                          // If there is no more data to read
                          if (done) {
                            controller.close();
                            return;
                          }
                          // Get the data and send it to the browser via the controller
                          controller.enqueue(value);
                          push();
                        })
                      }

                      push();
                    }
                  });
                }).then(stream => {
                  // Respond with our stream
                  return new Response(stream, {
                    headers: {
                      "Content-Type": "text/html"
                    }
                  }).text();
                }).then(result => {
                  let allocationsJSON = JSON.parse(result);
                  chrome.storage.sync.get(["evolv:confirmations"], function (confirmationsResult) {
                    let confirmationCIDs = getConfirmationCIDs(confirmationsResult["evolv:confirmations"]);

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

                    let expandButtonWrapperElements = document.querySelectorAll('.image-wrapper');
                    [].forEach.call(expandButtonWrapperElements, function (button) {
                      button.addEventListener('click', function (e) {
                        let experimentRowEl = e.target.closest('.experiment_row');
                        experimentRowEl.classList.contains('hide-info') ? experimentRowEl.classList.remove('hide-info') : experimentRowEl.classList.add('hide-info');
                      });
                    });
                  });
                });
              });
            });
          });
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
}

run();

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "confirmations_updated") {
      run();
    }
  }
);

// let refreshButton = document.getElementById('refreshButton');
// refreshButton.addEventListener('click', function (e) {
//   chrome.runtime.sendMessage({
//     message: "refresh_requested"
//   });

//   // send message to contentScript telling it to refresh our data
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {message: "refresh_requested"});
//   });
// });