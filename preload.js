const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld("electronAPI", {
    closeApp: () => ipcRenderer.send('closeApp'),
    showErrorDialog: (message) => ipcRenderer.invoke('show-error-dialog', message),
    showInfoDialog: (message) => ipcRenderer.invoke('show-info-dialog', message),
    showConfirmDialog: (message) => ipcRenderer.invoke('show-confirm-dialog', message)
})