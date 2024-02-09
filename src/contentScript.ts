import { waitForElement } from './shared/utils';
import { InitData } from './types';


const initData: InitData = {
    remoteContext: {},
    envID: '',
    uid: '',
    blockExecution: null,
    previewCid: null
};
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

window.addEventListener("load", () => {
    injectScript()
});

waitForElement('script[src*="evolv.ai/asset-manager"]').then(script => {
    initData.envID = script.dataset.evolvEnvironment;
});

const bootstrap = () => {
    initData.uid = window.localStorage.getItem('evolv:uid') || '(empty)';
    initData.blockExecution = window.sessionStorage.getItem('evolv:blockExecution') || null;
    initData.previewCid = window.sessionStorage.getItem('evolv:previewCid') || null;

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
                chrome.runtime.sendMessage({ message: 'evolv:remoteContext' });
            }
            break;
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
            isPopupOpen = false;
            break;

        case 'ping_content_script':
            isPopupOpen = true;
            break;

        case 'set_preview_cid':
            window.sessionStorage.setItem('evolv:previewCid', request.cid);
            window.location.reload();
            break;

        case 'clear_preview_cid':
            window.sessionStorage.removeItem('evolv:previewCid');
            window.location.reload();
            break;
    }
});
