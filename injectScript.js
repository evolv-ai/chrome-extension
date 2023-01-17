function isEvolvLoaded() {
    return window.evolv !== undefined &&
        window.evolv.context !== undefined &&
        window.evolv.context.remoteContext !== undefined &&
        window.evolv.context.remoteContext.experiments !== undefined &&
        window.evolv.context.remoteContext.experiments.allocations !== undefined
}

var pollingSafetyNet = 0;
function poll() {
    if (pollingSafetyNet++ < 50) {
        if (!isEvolvLoaded()) return setTimeout(poll, 100);

        window.postMessage({
            source: 'evolvTools',
            type: 'evolv:context',
            data: evolv.context.remoteContext
        }, '*')
    } else {
        // set the remoteContext to `(empty)`
        window.postMessage({
            source: 'evolvTools',
            type: 'evolv:context',
            data: '(empty)'
        }, '*')
    }

    setTimeout(function () {
        // tell contentScript.js that we're ready for it to run
        // contentScript.js lives in the Evotools Chrome Extension https://github.com/briannorman/evotools
        window.dispatchEvent(new Event('run_evotools_content_script'));
        window.runEvotoolsContentScript = true;
    }, 0);
};

poll();

/**	
 * Handle SPA transitions	
 */
window.addEventListener('locationchange', function () {
    pollingSafetyNet = 0;
    poll();
});

history.pushState = (f => function pushState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('locationchange'));
    return ret;
})(history.pushState);

history.replaceState = (f => function replaceState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('locationchange'));
    return ret;
})(history.replaceState);

window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'))
});