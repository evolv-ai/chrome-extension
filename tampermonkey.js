// ==UserScript==
// @name         EvoTools Helper
// @namespace    *verizon*
// @version      0.1
// @description  This script sets the Evolv allocations object in session storage in order to expose the allocations to the EvoTools Chrome extension.
// @author       Brian Norman
// @include      *
// @icon         https://imgur.com/zuOEoAT.png
// @grant        none
// ==/UserScript==

;
(function () {
  "use strict"

  function isEvolvLoaded() {
    return window.evolv !== undefined &&
      window.evolv.context !== undefined &&
      window.evolv.context.remoteContext !== undefined &&
      window.evolv.context.remoteContext.confirmations !== undefined;
  }

  let pollingSafetyNet = 0

  function poll() {
    if (pollingSafetyNet++ < 50) {
      if (!isEvolvLoaded()) {
        return setTimeout(poll, 50);
      }
    } else{
      console.log('EvoTools: Evolv not loaded.');
      return;
    }

    // set the updated confirmations
    window.sessionStorage.setItem("evolv:confirmations", JSON.stringify(window.evolv.context.remoteContext.confirmations));

    // tell contentScript.js that we're ready for it to run
    window.dispatchEvent(new Event('run_content_script'));
  }

  poll();

  /**
   * Handle SPA transitions
   */
  window.addEventListener('locationchange', function () {
    poll();
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
})();