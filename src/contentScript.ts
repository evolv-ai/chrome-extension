import { waitForElement } from './shared/utils';
import { InitData, Stage } from './types';
import { strings } from './shared/variables';


const initData: InitData = {
    remoteContext: {},
    envID: '',
    uid: '',
    previewCid: null,
    stage: null,
    snippetIsDisabled: true
};
let isPopupOpen = false

const injectScript = () => {
    if (document.getElementById('evolvTools:injectedScript')) {
        return;
    }

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injectScript.js');
    script.id = 'evolvTools:injectedScript';
    document.body.appendChild(script);
}

window.addEventListener("load", () => {
    injectScript()
});

const getStage = (evolvEndpoint: string): Stage => {
    if (!evolvEndpoint) {
        return Stage.Production;
    }

    if (evolvEndpoint.includes('-stg')) {
        return Stage.Staging;
    }

    if (evolvEndpoint.includes('-newdev')) {
        return Stage.Development;
    }

    return Stage.Production;
}

/**
 * Check for evolv:blockExecution BEFORE looking for the script
 * If found, we know the script is disabled
 * If not found, we assume the script is not detected
 * If we found the script, we know the snippet exists, so it is either enabled or disabled
 * We check for evolv:blockExecution to determine which
 */
const waitForEvolv = async () => {
    initData.blockExecution = window.sessionStorage.getItem('evolv:blockExecution')
      ? strings.snippet.disabled
      : strings.snippet.notDetected;

    try {
        const script: HTMLScriptElement | unknown = await waitForElement('script[src*="evolv.ai/asset-manager"], script[src*="localhost"][src*="webloader"]');

        if (script instanceof HTMLScriptElement) {
            initData.envID = script.dataset.evolvEnvironment;
            const evolvEndpoint = script.dataset.evolvEndpoint;
            initData.stage = getStage(evolvEndpoint);
            initData.blockExecution = window.sessionStorage.getItem('evolv:blockExecution')
              ? strings.snippet.disabled
              : strings.snippet.enabled;

            await chrome.runtime.sendMessage({ message: 'evolv:initialData', data: initData });
        }
    } catch {
        console.log('Evolv AI snippet not detected');
    }
}

const bootstrap = () => {
    initData.uid = window.localStorage.getItem('evolv:uid') || '(empty)';
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
            initData.snippetIsDisabled = e.data.snippetIsDisabled;

            if (isPopupOpen){
                chrome.runtime.sendMessage({ message: 'evolv:remoteContext', data: initData });
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
            waitForEvolv();
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

        case 'reset_evolv_uid':
            window.localStorage.removeItem('evolv:uid');
            window.location.reload();
            break;
    }
});
