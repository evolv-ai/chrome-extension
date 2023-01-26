const initData = {};
let isPopupOpen = false

const injectScript = () => {
    if (document.getElementById('evolvTools:injectedScript')) {
        return;
    }

    var script = document.createElement('script');
    script.src = chrome.runtime.getURL('injectScript.js');
    script.id = 'evolvTools:injectedScript';
    document.body.appendChild(script);
}

window.addEventListener("load", (event) => {
    injectScript()
});

const waitForElement = async selector => {
    while (document.querySelector(selector) === null) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    return document.querySelector(selector);
};

waitForElement('script[src*="evolv.ai/asset-manager"]').then(script => {
    const envID = script.dataset.evolvEnvironment;

    initData.envID = envID;
    if (isPopupOpen){
        chrome.runtime.sendMessage({ message: 'evolv:envId', data: envID });
    }
});

const bootstrap = () => {
    initData.uid = window.localStorage.getItem('evolv:uid') || '(empty)';
    initData.blockExecution = window.sessionStorage.getItem('evolv:blockExecution') || null;

    chrome.runtime.sendMessage({ message: 'evolv:initialData', data: initData });
};

window.addEventListener('message', (e) => {
    if(typeof e.data !== 'object' || e.data.source !== 'evoTools') {
        return
    }

    switch (e.data.type) {
        case 'evolv:context':
            initData.remoteContext = e.data.data;
            if (isPopupOpen){
                chrome.runtime.sendMessage({ message: 'evoTools:remoteContext', data: e.data.data });
            }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse({
        status: true
    });

    switch (request.message) {
        case 'enable_evolv':
            window.sessionStorage.removeItem('evolv:blockExecution');
            window.location.reload();
            break;
        case 'disable_evolv':
            window.sessionStorage.setItem('evolv:blockExecution', 'true');
            window.location.reload();
            break;
        
        case 'initialize_evoTools':
            window.postMessage({
                source: 'evoTools',
                type: 'evolv:refreshContext'
            }, '*');
            bootstrap();
            break;
        case 'evolv_popup_closed':
            isPopupOpen= false;
            break;
        case 'ping_content_script':
            isPopupOpen = true;
            break;
    }
});
