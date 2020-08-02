/* eslint-disable import/no-extraneous-dependencies */
import ChildProcess from 'child_process';
import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron' // eslint-disable-line
import fs from 'fs';
import os from 'os';
import path from 'path';

import JavaGuard from './js/assetGuard/javaGuard';
import Mojang from '../renderer/js/mojang';
import Whitelist from './js/whitelist';
import Minecraft from './js/minecraft';
import DistroManager from './js/distroManager';

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

ipcMain.on('mojang-login', async (ev, arg) => {
  const { username, password } = arg;
  await Mojang.authenticate(username, password)
    .then((data) => ev.reply('mojang-request', data))
    .catch((err) => ev.reply('mojang-request', err));
});

ipcMain.on('discord-oauth', async (ev) => {
  await Whitelist.requestCode(ev)
    .then((data) => ev.reply('discord-code', data))
    .catch((err) => ev.reply('discord-code', err));
});

ipcMain.on('java-scan', (ev) => {
  const forkEnv = JSON.parse(JSON.stringify(process.env));
  forkEnv.CONFIG_DIRECT_PATH = app.getPath('userData');

  // Fork a process to run validations
  const p = ChildProcess.fork(
    path.join(__dirname, './js/assetExecWrapper.cjs'),
    [
      `${app.getPath('userData')}`,
    ],
    {
      env: forkEnv,
      stdio: 'pipe',
    },
  );

  p.stdout.on('data', (data) => {
    // eslint-disable-next-line no-console
    console.log(data.toString());
  });

  p.stderr.on('data', (data) => {
    // eslint-disable-next-line no-console
    console.error(data.toString());
  });

  p.on('close', (code) => {
    // eslint-disable-next-line no-console
    console.log(`JavaScan exited with code ${code}`);
  });

  p.on('message', (msg) => {
    switch (msg.context) {
      case 'status-msg':
        ev.reply('launch-status', msg.data);
        break;
      case 'java-status':
        p.send({
          context: 'disconnect',
        });

        ev.reply('java-status', msg);
        break;
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unknown context: ${msg.context}`);
    }
  });

  p.send({
    context: 'validate-java',
  });
});

ipcMain.on('start-download', (ev, data) => {
  const forkEnv = JSON.parse(JSON.stringify(process.env));
  forkEnv.CONFIG_DIRECT_PATH = app.getPath('userData');

  // Fork a process to run validations
  const p = ChildProcess.fork(
    path.join(__dirname, './js/assetExecWrapper.cjs'),
    [
      `${app.getPath('userData')}`,
      data.javaExe,
      `${process.resourcesPath}`,
    ],
    {
      env: forkEnv,
      stdio: 'pipe',
    },
  );

  p.stdout.on('data', (data) => {
    // eslint-disable-next-line no-console
    console.log(data.toString());
  });

  p.stderr.on('data', (data) => {
    // eslint-disable-next-line no-console
    console.error(data.toString());
  });

  p.on('close', (code) => {
    // eslint-disable-next-line no-console
    console.log(`AssetGuard exited with code ${code}`);
  });

  p.on('message', (msg) => {
    switch (msg.context) {
      case 'status-msg':
        ev.reply('launch-status', msg.data);
        break;
      case 'progress':
        ev.reply('launch-progress', msg);
        break;
      case 'validate':
        ev.reply('validate-status', msg);
        break;
      case 'complete':
        break;
      case 'finished':
        p.send({
          context: 'disconnect',
        });
        ev.reply('validate-finished', msg.data);

        break;
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unknown context in start-game: ${msg.context}`);
    }
  });

  p.send({
    context: 'validate-pack',
    server: data.server,
  });
});

ipcMain.on('start-game', (ev, data) => {
  const forkEnv = JSON.parse(JSON.stringify(process.env));
  forkEnv.CONFIG_DIRECT_PATH = app.getPath('userData');

  // Fork a process to run validations
  const p = ChildProcess.fork(
    path.join(__dirname, './js/processExecWrapper.cjs'),
    [
      `${app.getPath('userData')}`,
      data.javaExe,
    ],
    {
      env: forkEnv,
      stdio: 'pipe',
    },
  );

  p.stdout.on('data', (data) => {
    // eslint-disable-next-line no-console
    console.log(data.toString());
  });

  p.stderr.on('data', (data) => {
    // eslint-disable-next-line no-console
    console.error(data.toString());
  });

  p.on('close', (code) => {
    // eslint-disable-next-line no-console
    console.log(`ProcessBuilder exited with code ${code}`);
  });

  p.on('message', (msg) => {
    switch (msg.context) {
      case 'game-close':
        ev.reply('game-close', msg.code);
        break;
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unknown context in start-game: ${msg.context}`);
    }
  });

  p.send({
    context: 'start-game',
    data,
  });
});

ipcMain.handle('discord-exchange', (_ev, code) => Whitelist.requestToken(code)
  .then((data) => JSON.stringify(data)));

ipcMain.handle('discord-refresh', (_ev, token) => Whitelist.refreshToken(token)
  .then((data) => JSON.stringify(data)));

ipcMain.handle('minecraft-logout', (_ev, payload) => {
  payload = JSON.parse(payload);

  Mojang.invalidate(payload.accessToken, payload.clientToken)
    .then((data) => JSON.stringify(data));
});

ipcMain.handle('whitelist-register', (_ev, payload) => {
  payload = JSON.parse(payload);

  Whitelist.link(payload.token, payload.uuid)
    .then((data) => JSON.stringify(data));
});

ipcMain.handle('whitelist-status', (_ev, token) => Whitelist.whitelistStatus(token)
  .then((data) => JSON.stringify(data)));

ipcMain.handle('minecraft-server', async (_ev, payload) => {
  payload = JSON.parse(payload);
  const server = new Minecraft(payload.address, payload.port);

  const data = await server.getStatus();
  return JSON.stringify(data);
});

ipcMain.handle('file-selector', () => new Promise((resolve, reject) => {
  const curWin = BrowserWindow.getFocusedWindow();

  const res = dialog.showOpenDialogSync(curWin, {
    title: 'Select your Minecraft Skin!',
    buttonLabel: 'Select Skin',
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'jpeg'] },
    ],
    properties: ['openFile', 'dontAddToRecent'],
  });

  if (res.length === 1) {
    fs.readFile(res[0], (err, data) => {
      if (err) {
        reject(Error('Unable to open selected file!'));
      }

      resolve({
        data,
        fileName: res[0],
      });
    });
  } else {
    reject(Error('No file selected!'));
  }
}));

ipcMain.handle('skin-upload', (_ev, payload) => new Promise((resolve, reject) => {
  const {
    token, uuid, skinType, filePath,
  } = payload;

  Mojang.uploadSkin(token, uuid, skinType, filePath)
    .then((data) => resolve(data))
    .catch((err) => reject(err));
}));

ipcMain.handle('distro-pull', () => DistroManager.pullRemote(app.getPath('userData')));

ipcMain.handle('java-details', (_ev, payload) => new Promise((resolve, reject) => {
  const jg = new JavaGuard(payload.mcVersion);

  return jg.validateJavaBinary(payload.exe)
    .then((data) => {
      if (data && data.valid) resolve(data);
      reject(Error('Invalid path to Java'));
    });
}));

// eslint-disable-next-line no-return-assign
ipcMain.on('total-memory', (ev) => ev.returnValue = (Number(os.totalmem() - 1_000_000_000) / 1_000_000_000).toFixed(1));

// eslint-disable-next-line no-return-assign
ipcMain.on('avail-memory', (ev) => ev.returnValue = (Number(os.freemem() - 1_000_000_000) / 1_000_000_000).toFixed(1));
