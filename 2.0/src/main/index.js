import { app, BrowserWindow } from 'electron' // eslint-disable-line
import path from 'path';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\') // eslint-disable-line
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 980,
    height: 552,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'assets', 'js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    useContentSize: true,
    backgroundColor: '#171614',
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.setResizable(true);

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse = true;

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
