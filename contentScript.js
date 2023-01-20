
let connectionPort;

const initData = {};

const injectScript = () => {
    var script = document.createElement('script');
    script.src = chrome.runtime.getURL('injectScript.js');
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

waitForElement('script[src*="participants"]').then(script => {
    if(!script.src.includes('.evolv.ai/v1/')) {
        return;
    }
    
    let src = script.src;
    let v1Index = src.indexOf('v1/');
    let envID = src.substr(v1Index + 3);
    let slashIndex = envID.indexOf('/');
    envID = envID.substr(0, slashIndex);

    initData.envID = envID;
    chrome.runtime.sendMessage({ message: 'evolv:envId', data: envID });
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
            chrome.runtime.sendMessage({ message: 'evoTools:remoteContext', data: e.data.data });
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
    }
});

bootstrap();
