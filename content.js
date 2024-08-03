const IFRAME_ID = 'chary-plg-fullIframe';
const POPUP_CONT = 'chary-plg-popupButtonContainer';
const POPUP_BUTTON = 'chary-plg-popupButton';
const POPUP_IMG = 'chary-plg-popupButtonImage';

function createAndReturnButton() {
    const popupButtonContainer = document.createElement('div');
    popupButtonContainer.id = POPUP_CONT;
    popupButtonContainer.innerHTML = getPopupHtml();
    document.body.appendChild(popupButtonContainer);

    popupButtonContainer.addEventListener('click', function() {
        toggleIframeVisibility()
    });

    const button = document.getElementById(POPUP_BUTTON)
    button.style.position = 'fixed';
    button.style.bottom = '60px';
    button.style.right = '20px';
    button.style.backgroundColor = 'cyan';
    button.style.border = 'none';
    button.style.padding = '2px';
    button.style.borderRadius = '10%';
    button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
    button.style.zIndex = '9999';
    button.style.cursor = 'pointer';
    button.addEventListener('focus', function () {
        button.style.outline = 'none';
    });
    const logoImage = document.getElementById(POPUP_IMG)
    logoImage.style.width = '45px';
    logoImage.style.height = '45px';
    logoImage.style.borderRadius = '10%';
    return button
}

createAndReturnButton();

// Create the full iframe
let fullIframeEle = document.createElement('iframe');
function setIframeStyleAndAppend(fullIframeEle, display) {
    fullIframeEle.id = IFRAME_ID;
    fullIframeEle.style.display = display;
    fullIframeEle.style.position = 'fixed';
    fullIframeEle.style.bottom = '0';
    fullIframeEle.style.right = '0';
    fullIframeEle.style.width = '500px';
    fullIframeEle.style.minHeight = '100vh';
    fullIframeEle.style.height = '100%';
    fullIframeEle.setAttribute('allow', 'clipboard-read; clipboard-write');
    fullIframeEle.style.zIndex = '999999';
    fullIframeEle.style.backgroundColor = 'white';
    fullIframeEle.style.border = '1px solid #ccc';
    fullIframeEle.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    document.body.appendChild(fullIframeEle);
    if (display === 'none') {
        showPopupButton()
    }
}
setIframeStyleAndAppend(fullIframeEle, 'none')

// Function to show the popup button with a slide-in animation
function showPopupButton() {
    let popupButton = document.getElementById(POPUP_BUTTON);
    if (!popupButton) {
        popupButton = createAndReturnButton()
    }
    popupButton.style.display = 'block';
}

// Function to hide the popup button with a slide-out animation
function hidePopupButton() {
    const popupButton = document.getElementById(POPUP_BUTTON);
    if (popupButton) {
        popupButton.style.display = 'none';
    }
}

// Function to show the iFrame button with a slide-in animation
function showFullIframe() {
    const iframe = document.getElementById(IFRAME_ID);
    if (iframe) {
        iframe.style.display = 'block';
    }
}

// Function to hide the iFrame button with a slide-out animation
function hideFullIframe() {
    const iframe = document.getElementById(IFRAME_ID);
    if (iframe) {
        iframe.style.display = 'none';
    }
}


// Function to handle tab URL changes
function handleTabUrlChange() {
    fullIframeEle.src = chrome.runtime.getURL('popup/index.html');
    // Check if the iframe is hidden
    if (isIframeHidden()) {
        showPopupButton();
    }
}

// Throttle the tab URL change handling to optimize performance
const throttledHandleTabUrlChange = throttle(handleTabUrlChange, 100);
let previousUrl = '';
const observer = new MutationObserver(function() {
    if (location.href !== previousUrl) {
        previousUrl = location.href;
        throttledHandleTabUrlChange()
    }
});
const config = {subtree: true, childList: true};
observer.observe(document, config);

// Update the full iframe with the initial tab URL
handleTabUrlChange();

function isIframeHidden() {
    return fullIframeEle.style.display === 'none'
}

// Function to toggle the visibility of the full iframe
function toggleIframeVisibility() {
    if (isIframeHidden()) {
        showFullIframe();
        hidePopupButton();
    } else {
        hideFullIframe()
        showPopupButton();
    }
}


// Message listener to handle requests from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'toggleIframeVisibility') {
        toggleIframeVisibility();
        sendResponse(true);
    }
});


// Function to set shared data
function setSharedData(key, value) {
    chrome.runtime.sendMessage({ type: 'set', key, value }, (response) => {
        // console.log('Set response:', response);
    });
}

// Function to get shared data
function getSharedData(key, callback) {
    chrome.runtime.sendMessage({ type: 'get', key }, (response) => {
        callback(response.value);
    });
}


function getPopupHtml() {
    let iconSrc = ''
    try {
        iconSrc = chrome.runtime.getURL('popup/images/logo48.png');
    } catch (e){}
    return `
        <button id="${POPUP_BUTTON}" title="Click View Profile">
            <img id="${POPUP_IMG}" src="${iconSrc}" alt="Logo">
        </button>
    `
}


// The page we load on iframe sends this event on click of the close button
// Listener for messages from the iframe
window.addEventListener('message', function(event) {
    const {href} = window.location
    if (event.data.action === 'closeIframe') {
        hideFullIframe()
        showPopupButton()
    } else if (event.data.action === 'render-client-application') {
        setSharedData(event.data.key, event.data.value);
        if(fullIframeEle.src !== event.data.value) {
            fullIframeEle.src = event.data.value
        }
    }  else if (event.data.type === 'set') {
        setSharedData(event.data.key, event.data.value);
    } else if (event.data.type === 'get') {
        getSharedData(event.data.key, (value) => {
            event.source.postMessage({ type: 'response', key: event.data.key, value }, event.origin);
        });
    }
});

// Function to throttle the execution of a function
function throttle(func, delay) {
    let timeoutId;
    return function (...args) {
        if (!timeoutId) {
            timeoutId = setTimeout(() => {
                func(...args);
                timeoutId = null;
            }, delay);
        }
    };
}

