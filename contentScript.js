const run = () => {
    const waitForElement = async selector => {
        while (document.querySelector(selector) === null) {
            await new Promise(resolve => requestAnimationFrame(resolve))
        }
        return document.querySelector(selector);
    };

    let uid = window.localStorage.getItem('evolv:uid') || '(empty)';
    let sid = window.sessionStorage.getItem('evolv:sid') || '(empty)';
    let allocations = window.sessionStorage.getItem('evolv:allocations') || '(empty)';
    let confirmations = JSON.parse(window.sessionStorage.getItem('evolv:confirmations')) || '(empty)';

    /**
     * Get the environmentID and set it in Chrome storage
     */
    waitForElement('script[src*="participants.evolv.ai/v1/"]').then(script => {
        let src = script.src;
        let v1Index = src.indexOf('v1/');
        let envID = src.substr(v1Index + 3);
        let slashIndex = envID.indexOf('/');
        envID = envID.substr(0, slashIndex);
        chrome.storage.sync.set({
            "evolv:envId": envID,
            "evolv:uid": uid,
            "evolv:sid": sid,
            "evolv:allocations": allocations,
            "evolv:confirmations": confirmations
        });
    });

    // inform popup.js that the confirmations have been updated
    setTimeout(function() {
        chrome.runtime.sendMessage({
            message: "confirmations_updated"
        });
    },0);
};

// check to see if the `run_content_script` window event has already fired.
if (window.runEvotoolsContentScript) {
    run();
}

// window event is triggered in evotools.js integration indicating that our extension is ready to rock'n'roll
window.addEventListener('run_evotools_content_script', function () {
    run();
});