# EvoTools

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

#### **5)** You're all set up!  Navigate to a page that you know has an active experiment, click the extension icon, and validate that you are seeing data.
<img src="https://imgur.com/AHn9ubo.png"/>

---

### Note:
We use `injectScript.js` to get the evolv remotecontext and send it to `evolvTool`. We actually have a bridge between webpage and `contentScript` to transfer data. We also can transfer data between `contentScript` and background as internal communication to make a complete data flow.

---

## Future Ideas 
* Log events as they are triggered.
* Link each combinations to the experiment in the manager
* List audiences user has qualified for
* Select desired combination - would likely need to talk to the manager
* Replicate `Resource Override`'s script injection/redirect functionality to eliminate the need for that extension.
    * Would allow us to be able to toggle environments