import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { defineIpcCalls } from '@/main/ipc-calls';
import { AiService } from '@/main/ai.service';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 900,
    minHeight: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      // TODO: Maybe revisit for security
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true,
      preload: join(__dirname, '../preload/index.js'),
    }
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';" +
          "style-src 'self' 'unsafe-inline';" +
          "img-src 'self' data:;" +
          "worker-src blob: ;" +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval"
        ]
      }
    });
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.on('window-all-closed', () => {
  // Kill any development servers or other processes you might have running
  if (process.env.NODE_ENV === 'development') {
    process.exit(0);
  }
  
  // Standard electron cleanup
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// If the quit event is triggered, make sure we exit
app.on('quit', () => {
  process.exit(0);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));

  const aiService = new AiService();

  defineIpcCalls(aiService);

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

