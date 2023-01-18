const injectScript = () => {
    var script = document.createElement('script');
    script.src = chrome.runtime.getURL('injectScript.js');
    document.body.appendChild(script);
}

const waitForElement = async selector => {
    while (document.querySelector(selector) === null) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    return document.querySelector(selector);
};

const run = () => {
    window.addEventListener("load", (event) => {
        injectScript()
    });

    chrome.storage.sync.set({
        "evolv:uid": window.localStorage.getItem('evolv:uid') || '(empty)',
    });
    chrome.storage.sync.set({
        "evolv:blockExecution": window.sessionStorage.getItem('evolv:blockExecution') || null,
    });


    waitForElement('script[src*="participants.evolv.ai/v1/"]').then(script => {
        let src = script.src;
        let v1Index = src.indexOf('v1/');
        let envID = src.substr(v1Index + 3);
        let slashIndex = envID.indexOf('/');
        envID = envID.substr(0, slashIndex);

        chrome.storage.sync.set({"evolv:envId": envID});
    });
};

run();

// this gets fired in evotools.js - https://gist.github.com/briannorman/153fb3d7cf8b170514343063cc2e43b5
// window event is triggered in evotools.js integration indicating that our extension is ready to rock'n'roll
window.addEventListener('run_evotools_content_script', function() {
    run();
});

window.addEventListener('message', (e) => {
    if(typeof e.data !== 'object' || e.data.source !== 'evoTools') {
        return
    }

    switch (e.data.type) {
        case 'evolv:context':
            chrome.storage.sync.set({ "evoTools:remoteContext": e.data.data })
    }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse({
        status: true
    });

    switch (request.message) {
        case 'refresh_data':
            // the locationchange event causes the manager integration to rerun
            window.postMessage({
                source: 'evoTools',
                type: 'evolv:refreshContext'
            }, '*');
            break;
        case 'enable_evolv':
            window.sessionStorage.removeItem('evolv:blockExecution');
            chrome.storage.sync.remove('evolv:blockExecution');
            window.location.reload();
            break;
        case 'disable_evolv':
            window.sessionStorage.setItem('evolv:blockExecution', 'true');
            chrome.storage.sync.set({ "evolv:blockExecution": true });
            window.location.reload();
            break;
    }
});
