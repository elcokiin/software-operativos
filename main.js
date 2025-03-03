const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

const createWindow = () => {
  const win = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')

  ipcMain.on('closeApp', () => {
    win.close()
  })

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
}

ipcMain.on('user-manual', () => {
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('user-manual.html')
})

app.whenReady().then(() => {
  createWindow()
})