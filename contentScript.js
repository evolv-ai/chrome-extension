window.sessionStorage.setItem('evoToolsEnabled', true);

const waitForElement = async selector => {
    while (document.querySelector(selector) === null) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    return document.querySelector(selector);
};

const run = () => {
    let uid = window.localStorage.getItem('evolv:uid') || '(empty)';
    let sid = window.sessionStorage.getItem('evolv:sid') || '(empty)';
    let remoteContext = window.sessionStorage.getItem('evoTools:remoteContext');
    let blockExecution = !!window.sessionStorage.getItem('evolv:blockExecution') && window.sessionStorage.getItem('evolv:blockExecution') !== 'false';

    // initialize storage to be empty
    chrome.storage.sync.set({
        "evolv:envId": '',
        "evolv:uid": uid,
        "evolv:sid": sid,
        "evoTools:remoteContext": remoteContext,
        "evolv:blockExecution": blockExecution
    });

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
            "evoTools:remoteContext": remoteContext,
            "evolv:blockExecution": blockExecution
        };

        chrome.storage.sync.set(evoStore);
    });
};

run();

// this gets fired in evotools.js - https://gist.github.com/briannorman/153fb3d7cf8b170514343063cc2e43b5
// window event is triggered in evotools.js integration indicating that our extension is ready to rock'n'roll
window.addEventListener('run_evotools_content_script', function() {
    run();
    console.log('hey brian run_evotools_content_script');
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse({
        status: true
    });

    switch (request.message) {
        case 'refresh_data':
            // the locationchange event causes the manager integration to rerun
            window.dispatchEvent(new Event('locationchange'));
            break;
        case 'enable_evolv':
            window.sessionStorage.removeItem('evolv:blockExecution');
            window.location.reload();
            break;
        case 'disable_evolv':
            window.sessionStorage.setItem('evolv:blockExecution', true);
            window.location.reload();
            break;
    }
});

// TODO  need to figure out how to only send message when popup is open
    // // listen for messages from popup.js
    // chrome.runtime.sendMessage({
    //     data: "update_popup"
    // });