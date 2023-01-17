# EvoTools (beta)


## Getting Started
---
#### **1)** In this Github project, click the green `Code` button and choose `Download ZIP`.  Save the zip file somewhere that you're not going to delete it by accident.  Once downloaded, open the zip file and you should see a directory named `evotools-main`.
<img src="https://imgur.com/8hvUBj4.png"/>

---

#### **2)** In Chrome, navigate to `chrome://extensions/` and enable `Developer mode` in the top right corner of the extensions page.
<img src="https://imgur.com/tiNQrFd.png"/>

---

#### **3)** Click the `Load Unpacked` button.  Select the `evotools-main` directory from step 1.    
<img src="https://imgur.com/ZRuTnzz.png"/>
<img src="https://imgur.com/ZyoiPfz.png"/>

---

#### **4)** You should now see the EvoTools extension enabled on the page.  You may also want to `pin` the extension for easy access.
<img src="https://imgur.com/YToW8bi.png"/>

---

#### **5)** We use `injectScript.js` to get the evolv remotecontext and send it to `evolvTool`. We actually have a bridge between webpage and `contentScript` to transfer data. We also can transfer data between `contentScript` and background as internal communication to make a complete data flow.

---

#### **6)** Name the integration `EvoTools` and click the `Add New Connector` button at the bottom of the page.
<img src="https://imgur.com/kBi2A9p.png"/>

---

#### **7)** In the Connector Source dropdown, choose the `Gist` option.  In the `Gist` input, enter `153fb3d7cf8b170514343063cc2e43b5`.  Click the `Create` button in the top right corner.  If you don't see your integration appear in the list of integrations, refresh the page.
<img src="https://imgur.com/p8lrM1H.png"/>

---

#### **8)** Navigate to the `Environments` tab and click on the environment that you'd like to add the integration to.  When the side-drawer opens, click the `Integrations` tab followed by the `Add Integration` dropdown.  Choose `EvoTools` and then click `Save` in the top right corner.
<img src="https://imgur.com/9n2qKcL.png"/>

---

#### **9)** You're all set up!  Navigate to a page that you know has an active experiment, click the extension icon, and validate that you are seeing data.
<img src="https://imgur.com/AHn9ubo.png"/>


---
---


This extension is still in the very early stages and hasn't been widely used so please report any issues or feature requests to brian.norman@evolv.ai.

---

## Possible Names for Extension:
* Evolv Debugger
* Evolv Assistant
* EvoEye
* Evolv Aeye
* EvoSpy
* Evolv Inspector
* Inspector Evo

---

## Future Ideas 
* Get extension into the Chrome store so that the install process is quick and easy.
* Convince Rob to add remoteContext to `sessionStorage` so that we can eliminate the need for the integration.
* Log events as they are triggered.
* Link each combinations to the experiment in the manager - need to get orgID and projectId somehow in order to create a link
* List audiences user has qualified for
* Select desired combination - would likely need to talk to the manager
* Replicate `Resource Override`'s script injection/redirect functionality to eliminate the need for that extension.
    * Would allow us to be able to toggle environments