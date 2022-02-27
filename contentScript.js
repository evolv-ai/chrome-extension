window.sessionStorage.setItem('evoToolsEnabled', true);


const waitForElement = async selector => {
    while (!document.querySelector(selector)) {
        await new Promise(resolve => requestAnimationFrame(resolve))
    }
    return document.querySelector(selector);
};

const run = () => {
    // initialize storage to be empty
    chrome.storage.sync.set({
        "evolv:envId": '',
        "evolv:uid": '',
        "evolv:sid": '',
        "evolv:allocations": '',
        "evolv:confirmations": '',
        "evolv:blockExecution": ''
    });

    // tell popup.js to clear the allocation data
    chrome.runtime.sendMessage({
        message: "clear_data"
    });

    let uid = window.localStorage.getItem('evolv:uid') || '(empty)';
    let sid = window.sessionStorage.getItem('evolv:sid') || '(empty)';
    let remoteContext = window.sessionStorage.getItem('evoTools:remoteContext');

    waitForElement('script[src*="participants.evolv.ai/v1/"]').then(script => {
        let src = script.src;
        let v1Index = src.indexOf('v1/');
        let envID = src.substr(v1Index + 3);
        let slashIndex = envID.indexOf('/');
        envID = envID.substr(0, slashIndex);

        evoStore = {
            "evolv:envId": envID,
            "evolv:uid": uid,
            "evolv:sid": sid,
            "evoTools:remoteContext": remoteContext
        };

        chrome.storage.sync.set(evoStore);

        // inform popup.js that the confirmations have been updated
        chrome.runtime.sendMessage({
            message: "confirmations_updated"
        });
    });
};

// this gets set in evotools.js - https://gist.github.com/briannorman/153fb3d7cf8b170514343063cc2e43b5
// check to see if the `run_content_script` window event has already fired.
if (window.runEvotoolsContentScript) {
    run();
}

// this gets fired in evotools.js - https://gist.github.com/briannorman/153fb3d7cf8b170514343063cc2e43b5
// window event is triggered in evotools.js integration indicating that our extension is ready to rock'n'roll
window.addEventListener('run_evotools_content_script', function () {
    run();
});

// listen for messages from popup.js
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === 'run_evotools_content_script') {
            run();
        } 
    }
);