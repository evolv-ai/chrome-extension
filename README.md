# EvoTools (beta)

This extension is still in the very early stages and hasn't been widely used so use it at your own risk.  Report any issues or feature requests to brian.norman@evolv.ai.

Follow the instructions below to get up and running:
1) Clone this repo.  Save it somewhere that you're not going to accidentally delete it.
2) Navigate to chrome://extensions/ and enable `Developer mode`.
3) Click `Load Unpacked`.  Choose the evotools project that you cloned.  Enable the EvoTools extension.  You may also want to `pin` the extension so it is easy to find in your browser.
4) Install the Chrome extension, [TamperMonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo/related).  
    > We need this extension to set the allocations object on the window since the extension can't read the `window.evolv` object on its own.  We could eliminate this dependency if the Evolv tool automatically added the allocations object to sessionStorage so that the data is exposed to this extension.
5) Create a new script in Tampermonkey and give it the code from `/tampermonkey.js` in this repo.  You may need to modify `@namespace` if you're working on any site other than Verizon.  I plan to add an options page in the future where you can set a list of allowed URLs.
6) Be sure to save your script in Tampermonkey and also ensure that it is enabled.

---

## Future Ideas 
* Add an 'opt-out' button to block evolv requests.
* Link to combinations in manager - need to get org id somehow and find a way to relate the phaseID to the projectID
* Force combo functionality
* Log events triggered
* Replicate `Resource Override`'s script injection/redirect functionality to eliminate the need for that extension.
* Messaging for reason that allocation was not confirmed.  For example, targeting doesn't match or audience requirements not met.