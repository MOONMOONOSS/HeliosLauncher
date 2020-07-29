import { app } from 'electron';
import crypto from 'crypto';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

import DistroTypes from './distribution/types';

import Util from './assetGuard/util';

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

  constructor(
    distroServer,
    versionData,
    forgeData,
    authUser,
    launcherVersion,
    modConfig,
    optionalsConfig,
    javaConfig,
  ) {
    this.authUser = authUser;
    this.commonDir = app.getPath('appData');
    this.forgeData = forgeData;
    this.gameDir = path.join(this.commonDir, 'instances', distroServer.id);
    this.fmlDir = path.join(this.gameDir, 'forgeModList.json');
    this.javaConfig = javaConfig;
    this.launcherVersion = launcherVersion;
    this.libPath = path.join(this.commonDir, 'libraries');
    this.modConfig = modConfig;
    this.optionalsConfig = optionalsConfig;
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
    const modArr = this.resolveModConfiguration();

    // Mod list below 1.13
    if (!Util.mcVersionAtLeast('1.13', this.server.minecraftVersion)) {
      this.constructModList(DistroTypes.ForgeMod, modArr, true);
    }

    let args = this
  }

  resolveModConfiguration(modCfg, modules) {
    let enabledMods = [];
    let config;

    if (!modCfg && !modules) {
      config = this.modConfig;
    }

    config.forEach((module) => {
      const { type } = module;

      if (type === DistroTypes.ForgeMod || type === DistroTypes.FabricMod) {
        if (module.hasSubModules()) {
          const v = this.resolveModConfiguration(
            config[module.getVersionlessId()].mods,
            module.subModules,
          );

          enabledMods = enabledMods.concat(v);
        }

        if (module.required.required) {
          enabledMods.push(module);
        } else {
          const match = this.optionalsConfig.find((m) => m.id === module.id);
          if (match && match.enabled) {
            enabledMods.push(module);
          }
        }
      }
    });

    return enabledMods;
  }

  belowOneSeven() {
    return Number(this.forgeData.id.split('-')[0].split('.')[1]) <= 7;
  }

  requiresAbsolute() {
    if (this.belowOneSeven()) return false;

    try {
      const ver = this.forgeData.id.split('-')[2];
      const pts = ver.split('.');
      const min = [14, 23, 3, 2655];

      for (let i = 0; i < pts.length; i += 1) {
        const parsed = parseInt(pts[i], 10);

        if (parsed < min[i]) {
          return false;
        }

        if (parsed > min[i]) {
          return true;
        }
      }
    // eslint-disable-next-line no-empty
    } catch (_) {}

    return true;
  }

  constructModList(type, mods, save = false) {
    const absVal = (type === DistroTypes.ForgeMod && this.requiresAbsolute()) ? 'absolute:' : '';
    const modList = {
      repositoryRoot: `${absVal}${path.join(this.commonDir, 'modstore')}`,
    };
    const ids = [];

    switch (type) {
      case DistroTypes.ForgeMod:
        mods.forEach((module) => ids.push(module.extensionlessId()));
        break;
      default:
        mods.forEach((module) => ids.push(`${module.extensionlessId()}@${module.artifactExt}`));
    }

    modList.modRef = ids;

    if (save) {
      const data = JSON.stringify(modList, null, 4);
      fs.writeFileSync(this.fmlDir, data, 'UTF-8');
    }

    return modList;
  }

  constructJvmArgs(mods, tempNativePath) {
    if (Util.mcVersionAtLeast('1.13', this.server.minecraftVersion)) {
      return this.constructJvmArgs113(mods, tempNativePath);
    }

    return this.constructJvmArgs112(mods, tempNativePath);
  }

  constructJvmArgs112(mods, tempNativePath) {
    let args = [];

    // Classpath Argument
    args.push('-cp');
    args.push(this.classpathArg(mods, tempNativePath).join(process.platform === 'win32' ? ';' : ':'));

    args.push(`-Xmx${this.javaConfig.maxRam}`);
    args.push(`-Xms${this.javaConfig.minRam}`);
    args = args.concat(this.javaConfig.jvmOptions);
    args.push(`-Djava.library.path=${tempNativePath}`);

    // Main Java class
    if (this.forgeData === null) {
      args.push(this.versionData.mainClass);
    } else {
      args.push(this.forgeData.mainClass);
    }

    return args;
  }

  constructJvmArgs113(mods, tempNativePath) {
    const argDiscovery = /\${*(.*)}/;

    let args = this.versionData.arguments.jvm;

    args.push(`-Xmx${this.javaConfig.maxRam}`);
    args.push(`-Xms${this.javaConfig.minRam}`);
    args = args.concat(this.javaConfig.jvmOptions);
    args.push(`-Djava.library.path=${tempNativePath}`);

    // Main Java class
    if (this.forgeData === null) {
      args.push(this.versionData.mainClass);
    } else {
      args.push(this.forgeData.mainClass);
    }

    // Vanilla args
    args = args.concat(this.versionData.arguments.game);

    return args;
  }
}
