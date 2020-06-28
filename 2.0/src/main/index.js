import { app, BrowserWindow, Menu } from 'electron' // eslint-disable-line
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

function createMenu() {
  if (process.platform === 'darwin') {
    // Extend default included application menu to continue support for quit keyboard shortcut
    const applicationSubMenu = {
      label: 'Application',
      submenu: [
        {
          label: 'About Application',
          selector: 'orderFrontStandardAboutPanel:',
        },
        {
          type: 'separator',
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };

    // New edit menu adds support for text-editing keyboard shortcuts
    const editSubMenu = {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          selector: 'undo:',
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          selector: 'redo:',
        },
        {
          type: 'separator',
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          selector: 'cut:',
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          selector: 'copy:',
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          selector: 'paste:',
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:',
        },
      ],
    };

    // Bundle submenus into a single template and build a menu object with it
    const menuTemplate = [applicationSubMenu, editSubMenu];
    const menuObject = Menu.buildFromTemplate(menuTemplate);

    // Assign it to the application
    Menu.setApplicationMenu(menuObject);
  }
}

// https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse = true;

app.on('ready', createWindow);
app.on('ready', createMenu);

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