import { app } from 'electron';
import crypto from 'crypto'
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

export default class ProcessBuilder {
  authUser;

  commonDir;

  forgeData;

  fmlDir;

  gameDir;

  launcherVersion;

  libPath;

  server;

  versionData;

  constructor(distroServer, versionData, forgeData, authUser, launcherVersion, modConfiguration) {
    this.authUser = authUser;
    this.commonDir = app.getPath('appData');
    this.forgeData = forgeData;
    this.gameDir = path.join(this.commonDir, 'instances', distroServer.id);
    this.fmlDir = path.join(this.gameDir, 'forgeModList.json');
    this.launcherVersion = launcherVersion;
    this.libPath = path.join(this.commonDir, 'libraries');
    this.modConfiguration = modConfiguration;
    this.server = distroServer;
    this.versionData = versionData;
  }

  build() {
    process.throwDeprecation = true;

    fs.ensureDirSync(this.gameDir);
    const tempNativePath = path.join(
      os.tmpdir(),
      'MOONMOON',
      crypto.pseudoRandomBytes(16).toString('hex'),
    );
    const modObj = this.resolveModConfiguration(this.modConfiguration, this.server.modules);
  }
}
