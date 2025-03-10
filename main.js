const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

// Store window references
let mainWindow;
let userManualWindow;

// Set up IPC handlers globally (outside of window creation functions)
ipcMain.handle('show-error-dialog', async (event, message) => {
  return dialog.showMessageBoxSync({
    type: 'error',
    title: 'Error',
    message
  });
})

ipcMain.handle('show-info-dialog', async (event, message) => {
  return dialog.showMessageBoxSync({
    type: 'info',
    title: 'Información',
    message: message
  });
});

// Para mostrar un diálogo de confirmación que devuelve true (sí) o false (no)
ipcMain.handle('show-confirm-dialog', async (event, message) => {
  const response = await dialog.showMessageBox({
    type: 'question',
    buttons: ['Sí', 'No'],
    title: 'Confirmación',
    message: message,
    defaultId: 1,
    cancelId: 1
  });
  
  // Devuelve true si el usuario seleccionó "Sí" (índice 0)
  return response.response === 0;
});

// Handle closing any window
ipcMain.on('closeApp', (event) => {
  // Get the sender window
  const senderWindow = BrowserWindow.fromWebContents(event.sender);
  if (senderWindow) {
    senderWindow.close();
  }
})

const createWindow = () => {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')
}

// Handle user manual window creation
ipcMain.on('user-manual', () => {
  userManualWindow = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js')
    }
  })

  userManualWindow.loadFile('user-manual.html')
})

app.whenReady().then(() => {
  createWindow()
})