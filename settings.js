/// WOAH HEY BRIAN
// something below is causing us to not be able to visit app.evolv.ai rather than blocking network requests to that domain



// const DISABLE_EVOLV_RULE_ID = 1;
// const disableEvolv = () => {
//     console.log('hey brian disable evolv');
//     chrome.declarativeNetRequest.updateDynamicRules({
//         addRules: [{
//             "id": DISABLE_EVOLV_RULE_ID,
//             "priority": 1,
//             "action": {
//                 "type": "block"
//             },
//             "condition": {
//                 "urlFilter": domain,
//                 "resourceTypes": ["main_frame"]
//             }
//         }]
//     });
// };
// const enableEvolv = () => {
//     console.log('hey brian enable evolv');

//     chrome.declarativeNetRequest.updateDynamicRules({
//         removeRuleIds: [DISABLE_EVOLV_RULE_ID]
//     });
// };



// // Set and persist settings value for `disable Evolv` option
// chrome.storage.sync.get(["evolv:disable-evolv"], function (result) {
//     let disableEvolvInput = document.getElementById('disable-evolv');
//     disableEvolvInput.checked = result["evolv:disable-evolv"] || false;
//     disableEvolvInput.addEventListener('change', () => {
//         let isChecked = disableEvolvInput.checked;
//         chrome.storage.sync.set({
//             "evolv:disable-evolv": isChecked
//         });

//         if (isChecked) {
//             disableEvolv();
//         } else {
//             enableEvolv();
//         }
//     });
// });