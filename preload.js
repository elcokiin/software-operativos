const { contextBridge, ipcRenderer } = require('electron')

// const {
// 	documentExport,
// 	documentImport,
// 	askUserToDiscardChanges,
// } = require('./lib/modals');

contextBridge.exposeInMainWorld("electronAPI", {
    closeApp: () => ipcRenderer.send('closeApp'),
    showErrorDialog: (message) => ipcRenderer.invoke('show-error-dialog', message),
    showInfoDialog: (message) => ipcRenderer.invoke('show-info-dialog', message),
    showConfirmDialog: (message) => ipcRenderer.invoke('show-confirm-dialog', message),
    userManual: () => ipcRenderer.send('user-manual'),
    processPlatform: () => process.platform,
	// documentExport,
	// documentImport,
	// askUserToDiscardChanges,
})
