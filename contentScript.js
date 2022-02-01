const waitForElement = async selector => {
    while (!document.querySelector(selector)) {
        await new Promise(resolve => requestAnimationFrame(resolve))
    }
    return document.querySelector(selector);
};

const run = () => {
    chrome.storage.sync.set({
        "evolv:envId": '',
        "evolv:uid": '',
        "evolv:sid": '',
        "evolv:allocations": '',
        "evolv:confirmations": '',
        "evolv:blockExecution": ''
    });

    chrome.runtime.sendMessage({
        message: "clear_data"
    });

    let uid = window.localStorage.getItem('evolv:uid') || '(empty)';
    let sid = window.sessionStorage.getItem('evolv:sid') || '(empty)';
    let allocations = window.sessionStorage.getItem('evolv:allocations') !== "(empty)" ? window.sessionStorage.getItem('evolv:allocations') : '(empty)';
    let confirmations = window.sessionStorage.getItem('evolv:confirmations') !== "(empty)" ? window.sessionStorage.getItem('evolv:confirmations') : '(empty)';
    
    waitForElement('script[src*="participants.evolv.ai/v1/"]').then(script => {
        let src = script.src;
        let v1Index = src.indexOf('v1/');

        let envID = src.substr(v1Index + 3);
        let slashIndex = envID.indexOf('/');
        envID = envID.substr(0, slashIndex);

        let executionBlocked = window.sessionStorage.getItem('evolv:blockExecution') && window.sessionStorage.getItem('evolv:blockExecution') === 'true';

        chrome.storage.sync.set({
            "evolv:envId": envID,
            "evolv:uid": uid,
            "evolv:sid": sid,
            "evolv:allocations": allocations,
            "evolv:confirmations": confirmations,
            "evolv:blockExecution": executionBlocked
        });

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

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === 'run_evotools_content_script') {
            run();
        }
    }
);

/**
 * Handle SPA transitions
 */
window.addEventListener('locationchange', function () {
    run();
});

history.pushState = (f => function pushState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('pushState'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
})(history.pushState);

history.replaceState = (f => function replaceState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('replaceState'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
})(history.replaceState);

window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'))
});