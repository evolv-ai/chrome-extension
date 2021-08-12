const waitForElement = async selector => {
    while (document.querySelector(selector) === null) {
        await new Promise(resolve => requestAnimationFrame(resolve))
    }
    return document.querySelector(selector);
};

/**
 * Get the environmentID and set it in Chrome storage
 */
waitForElement('script[src*="participants.evolv.ai/v1/"]').then(el => {
    let src = el.src;
    let v1Index = src.indexOf('v1/');
    let envID = src.substr(v1Index + 3);
    let slashIndex = envID.indexOf('/');
    envID = envID.substr(0, slashIndex);

    chrome.storage.sync.set({ "envID": envID });
});

/**
 * Set the User ID in Chrome storage
 */
let uid = window.localStorage.getItem('evolv:uid');
chrome.storage.sync.set({ "evolv:uid": uid });

/**
 * Set the Session ID in Chrome storage
 */
let sid = window.sessionStorage.getItem('evolv:sid');
chrome.storage.sync.set({ "evolv:sid": sid });

/**
 * Set the Candidate Token in Chrome storage
 */
let candidateToken = window.sessionStorage.getItem('evolv:candidateToken');
chrome.storage.sync.set({ "evolv:candidateToken": candidateToken });

/**
 * Grab the allocations from sessionStorage and set it in chrome storage.
 * The allocations are set by the Tampermonkey script.
 */
let allocations = JSON.parse(window.sessionStorage.getItem('evolv:allocations'))
chrome.storage.sync.set({ "evolv:allocations": allocations });

/**
 * Listen for messages coming from the extension
 */
// chrome.runtime.onMessage.addListener(
//     function (request, sender, sendResponse) {
//         if (request.action === 'update_values') {
//             console.log('hey brian request', request)
//             window.localStorage.setItem('evolv:uid', request.content.uid);
//             window.sessionStorage.setItem('evolv:sid', request.content.sid);
//             window.sessionStorage.setItem('evolv:candidateToken', request.content.candidateToken);

//             sendResponse("values updated");
//         }
//     }
// );
