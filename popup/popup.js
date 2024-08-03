let setInputButton
let inputField
let getInputButton
let outputField
let closeButton
let viewApplicationButton
const userApplicationUrl = 'user-application-url'
const sendMessage = (message) => {
    window.parent.postMessage(message, '*')
}

const storeToExtension = (key, value) => {
    sendMessage({ type: 'set', key, value })
}

const getFromExtension = (key) => {
    sendMessage({ type: 'get', key })
}

const load = () => {
    setInputButton = document.getElementById('set-input-button')
    inputField = document.getElementById('input-field')
    getInputButton = document.getElementById('get-input-button')
    outputField = document.getElementById('output-field')
    closeButton = document.getElementById('close-button')
    viewApplicationButton = document.getElementById('view-application')
    if(setInputButton) {
        setInputButton.addEventListener('click', (e) => {
            const data = inputField.value
            if(data) {
                storeToExtension(userApplicationUrl, data )
                getFromExtension(userApplicationUrl)
            }

        })
    }
    if(getInputButton) {
        getInputButton.addEventListener('click', (e) => {
            getFromExtension(userApplicationUrl)
        })
    }
    if(closeButton) {
        closeButton.addEventListener('click', (e) => {
            sendMessage({action: 'closeIframe'})
        })
    }
    if(viewApplicationButton) {
        viewApplicationButton.addEventListener('click', (e) => {
            if(inputField.value) {
                sendMessage({action: 'render-client-application', value: inputField.value })
            }
        })
    }
    getFromExtension(userApplicationUrl)
}
window.addEventListener('message', (event) => {
    if (event.data.type === 'response' && event.data.key === userApplicationUrl) {
        if(event.data.value) {
            console.log("Received value: ", event.data.value)
            outputField.value = event.data.value
        }
    }
})
load()
