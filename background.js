// chrome.runtime.onMessage.addListener(function (request) {
//     if (request.message === 'confirmations_updated') {
//         //   removeAllocations();
//         //   run();
//     } else if (request.message === "clear_data") {
//         //   removeAllocations();
//     }

//     chrome.runtime.Port.disconnect();
// });


// chrome.storage.onChanged.addListener(function (changes, namespace) {
//     for (let [key, {
//             oldValue,
//             newValue
//         }] of Object.entries(changes)) {
//         console.log(
//             `Storage key "${key}" in namespace "${namespace}" changed.`,
//             `Old value was "${oldValue}", new value is "${newValue}".`
//         );
//     }
// })


// chrome.tabs.executeScript(
//     tabId: number,
//     details: InjectDetails,
//     callback: function,
//   );




// Listen for a click on the camera icon. On that click, take a screenshot.
// chrome.browserAction.onClicked.addListener(function() {

//     chrome.tabs.captureVisibleTab(function(screenshotUrl) {
//       var viewTabUrl = chrome.extension.getURL('screenshot.html?id=' + id++)
//       var targetId = null;

//       chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
//         // We are waiting for the tab we opened to finish loading.
//         // Check that the tab's id matches the tab we opened,
//         // and that the tab is done loading.
//         if (tabId != targetId || changedProps.status != "complete")
//           return;

//         // Passing the above test means this is the event we were waiting for.
//         // There is nothing we need to do for future onUpdated events, so we
//         // use removeListner to stop getting called when onUpdated events fire.
//         chrome.tabs.onUpdated.removeListener(listener);

//         // Look through all views to find the window which will display
//         // the screenshot.  The url of the tab which will display the
//         // screenshot includes a query parameter with a unique id, which
//         // ensures that exactly one view will have the matching URL.
//         var views = chrome.extension.getViews();
//         for (var i = 0; i < views.length; i++) {
//           var view = views[i];
//           if (view.location.href == viewTabUrl) {
//             view.setScreenshotUrl(screenshotUrl);
//             break;
//           }
//         }
//       });

//       chrome.tabs.create({url: viewTabUrl}, function(tab) {
//         targetId = tab.id;
//       });
//     });
//   });





