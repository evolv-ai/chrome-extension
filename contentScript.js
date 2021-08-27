function run() {
    console.log('hey brian run content script');
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
        chrome.storage.sync.set({
            "envID": envID
        });
    });

    /**
     * Set the User ID in Chrome storage
     */
    let uid = window.localStorage.getItem('evolv:uid');
    chrome.storage.sync.set({
        "evolv:uid": uid
    });

    /**
     * Set the Session ID in Chrome storage
     */
    let sid = window.sessionStorage.getItem('evolv:sid');
    chrome.storage.sync.set({
        "evolv:sid": sid
    });

    /**
     * Grab the confirmations from sessionStorage and set it in chrome storage.
     * The confirmations are set by the Tampermonkey script.
     */
    let confirmations = JSON.parse(window.sessionStorage.getItem('evolv:confirmations')) || '';
    chrome.storage.sync.set({
        "evolv:confirmations": confirmations
    });
    
    // inform popup.js that the confirmations have been updated
    chrome.runtime.sendMessage({
        message: "confirmations_updated"
    });

    // /**
    //  * Set the Candidate Token in Chrome storage
    //  */
    // let candidateToken = window.sessionStorage.getItem('evolv:candidateToken');
    // chrome.storage.sync.set({
    //     "evolv:candidateToken": candidateToken
    // });
}

// window event is triggered in tampermonkey.js indicating that our extension is ready to rock'n'roll
window.addEventListener('run_content_script', function () {
    run();
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "refresh_requested")
            run();
    }
);