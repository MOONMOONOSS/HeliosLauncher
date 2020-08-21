import ChildProcess from 'child_process';
import crypto from 'crypto';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

import AdmZip from 'adm-zip';

import DistroTypes from './distribution/types';
import Module from './distribution/module';

import Util from './assetGuard/util';
import Library from './assetGuard/library';

export default class ProcessBuilder {
  static GAME_READY = /^\[.+\]: Forge Mod Loader has successfully loaded .+$/;

  authUser;

  commonDir;

  forgeData;

  fmlDir;

  gameDir;

  launcherVersion;

  libPath;

  minecraftConfig;

  modConfig;

  javaConfig;

  server;

  versionData;

  constructor(
    distroServer,
    versionData,
    forgeData,
    authUser,
    launcherVersion = 2,
    modConfig,
    javaConfig,
    minecraftConfig,
    commonDir,
  ) {
    this.authUser = authUser;
    this.commonDir = commonDir;
    this.forgeData = forgeData;
    this.gameDir = path.join(this.commonDir, 'instances', distroServer.id);
    this.fmlDir = path.join(this.gameDir, 'mods', 'mod_list.json');
    this.javaConfig = javaConfig;
    this.launcherVersion = launcherVersion;
    this.libPath = path.join(this.commonDir, 'libraries');
    this.minecraftConfig = minecraftConfig;
    this.modConfig = modConfig;
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
    const modArr = this.modConfig;

    // Mod list below 1.13
    if (!Util.mcVersionAtLeast('1.13', this.server.minecraftVersion)) {
      this.constructModList(DistroTypes.ForgeMod, modArr, true);
    }

    let args = this.constructJvmArgs(this.modConfig, tempNativePath);

    if (Util.mcVersionAtLeast('1.13', this.server.minecraftVersion)) {
      args = args.concat(ProcessBuilder.constructModArgs(this.modConfig));
    }

    // eslint-disable-next-line no-console
    console.log('Launch Args:');
    // eslint-disable-next-line no-console
    console.dir(args);

    const child = ChildProcess.spawn(this.javaConfig.javaExe, args, {
      cwd: this.gameDir,
      detached: true,
    });

    child.unref();

    child.stdout.on('data', (data) => {
      if (ProcessBuilder.GAME_READY.test(data.toString().trim())) {
        process.send({
          context: 'game-ready',
        });

        return;
      }
      // eslint-disable-next-line no-console
      console.log(data.toString());
    });

    child.stderr.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.error(data.toString());
    });

    child.on('close', (code) => {
      // eslint-disable-next-line no-console
      console.log('Exited with code', code);
      fs.remove(tempNativePath, (err) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.warn('Could not delete temp dir', err);
        } else {
          // eslint-disable-next-line no-console
          console.log('Temp dir deleted successfully');
        }
      });

      process.send({
        context: 'game-close',
        code,
      });
    });

    return child;
  }

  belowOneSeven() {
    if (this.forgeData) {
      return Number(this.forgeData.id.split('-')[0].split('.')[1]) <= 7;
    }

    // Vanilla 1.7 and below is not supported
    return false;
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
    const modList = {
      repositoryRoot: '../../common/modstore/',
    };
    const ids = [];

    switch (type) {
      case DistroTypes.ForgeMod:
        mods.forEach((module) => {
          module = new Module(null, null, module);
          if (module.type === 'ForgeMod') {
            ids.push(module.extensionlessId());
          }
        });
        break;
      default:
    }

    modList.modRef = ids;

    if (save) {
      const data = JSON.stringify(modList, null, 4);
      fs.ensureFileSync(this.fmlDir);
      fs.writeFileSync(this.fmlDir, data, 'UTF-8');
    }

    return modList;
  }

  static constructModArgs(mods) {
    const argStr = mods.map((mod) => new Module(null, null, mod).extensionlessId())
      .join(',');

    if (argStr) {
      return [
        '--fml.mavenRoots',
        path.join('..', '..', 'common', 'modstore'),
        '--fml.mods',
        argStr,
      ];
    }

    return [];
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

    args.push(`-Xmx${this.javaConfig.maxRam * 1000}M`);
    args.push(`-Xms${this.javaConfig.minRam * 1000}M`);
    args = args.concat(this.javaConfig.jvmOptions);
    args.push(`-Djava.library.path=${tempNativePath}`);

    // Main Java class
    if (!this.forgeData) {
      args.push(this.versionData.mainClass);
    } else {
      args.push(this.forgeData.mainClass);
    }

    // Forge Arguments
    args = args.concat(this.resolveForgeArgs());

    return args;
  }

  constructJvmArgs113(mods, tempNativePath) {
    const argDiscovery = /\${*(.*)}/;

    let args = this.versionData.arguments.jvm;

    args.push(`-Xmx${this.javaConfig.maxRam * 1000}M`);
    args.push(`-Xms${this.javaConfig.minRam * 1000}M`);
    args = args.concat(this.javaConfig.jvmOptions);
    args.push(`-Djava.library.path=${tempNativePath}`);

    // Main Java class
    if (!this.forgeData) {
      args.push(this.versionData.mainClass);
    } else {
      args.push(this.forgeData.mainClass);
    }

    // Vanilla args
    args = args.concat(this.versionData.arguments.game);

    for (let i = 0; i < args.length; i += 1) {
      if (typeof args[i] === 'object' && args[i].rules != null) {
        let checksum = 0;
        // eslint-disable-next-line no-loop-func
        args[i].rules.forEach((rule, ruleIdx) => {
          if (rule.os) {
            if (rule.os.name === Library.mojangFriendlyOs()
              && (!rule.os.version || new RegExp(rule.os.version).test(os.release))) {
              if (rule.action === 'allow') {
                checksum += 1;
              }
            } else if (rule.action === 'disallow') {
              checksum += 1;
            }
          } else if (rule.features) {
            // We don't have many 'features' in the index at the moment.
            // This should be fine for a while.
            if (rule.features.has_custom_resolution && rule.features.has_custom_resolution) {
              if (this.minecraftConfig.fullScreen) {
                args[i].rules[ruleIdx].values = [
                  '--fullscreen',
                  'true',
                ];
              }
              checksum += 1;
            }
          }
        });

        // TODO splice not push
        if (checksum === args[i].rules.length) {
          if (typeof args[i].value === 'string') {
            args[i] = args[i].value;
          } else if (typeof args[i].value === 'object') {
            // args = args.concat(args[i].value)
            args.splice(i, 1, ...args[i].value);
          }

          // Decrement i to reprocess the resolved value
          i -= 1;
        } else {
          args[i] = null;
        }
      } else if (typeof args[i] === 'string') {
        if (argDiscovery.test(args[i])) {
          const identifier = args[i].match(argDiscovery)[1];
          let val;
          switch (identifier) {
            case 'auth_player_name':
              val = this.authUser.displayName.trim();
              break;
            case 'version_name':
              // val = versionData.id
              val = this.server.id;
              break;
            case 'game_directory':
              val = this.gameDir;
              break;
            case 'assets_root':
              val = path.join(this.commonDir, 'assets');
              break;
            case 'assets_index_name':
              val = this.versionData.assets;
              break;
            case 'auth_uuid':
              val = this.authUser.uuid.trim();
              break;
            case 'auth_access_token':
              val = this.authUser.accessToken;
              break;
            case 'user_type':
              val = 'mojang';
              break;
            case 'version_type':
              val = this.versionData.type;
              break;
            case 'resolution_width':
              [val] = this.minecraftConfig.resolution;
              break;
            case 'resolution_height':
              [, val] = this.minecraftConfig.resolution;
              break;
            case 'natives_directory':
              val = args[i].replace(argDiscovery, tempNativePath);
              break;
            case 'launcher_name':
              val = args[i].replace(argDiscovery, 'Helios-Launcher');
              break;
            case 'launcher_version':
              val = args[i].replace(argDiscovery, this.launcherVersion);
              break;
            case 'classpath':
              val = this.classpathArg(mods, tempNativePath).join(process.platform === 'win32' ? ';' : ':');
              break;
            default:
          }
          if (val != null) {
            args[i] = val;
          }
        }
      }
    }

    // Forge Specific Args
    // Ignore if Forge is not present
    if (this.forgeData) {
      args = args.concat(this.forgeData.arguments.game);
    }

    // Filter null values
    args = args.filter((argument) => argument);

    return args;
  }

  resolveForgeArgs() {
    let mcArgs;
    if (this.forgeData) {
      mcArgs = this.forgeData.minecraftArguments.split(' ');
    } else {
      // eslint-disable-next-line no-console
      console.warn('forgeData is missing. The game will launch in Vanilla mode!');
      mcArgs = this.versionData.minecraftArguments.split(' ');
    }
    const argDiscovery = /\${*(.*)}/;

    // Replace the declared variables with their proper values.
    mcArgs.forEach((argument, idx, arr) => {
      if (argDiscovery.test(argument)) {
        const ident = argument.match(argDiscovery)[1];
        let val;

        switch (ident) {
          case 'auth_player_name':
            val = this.authUser.displayName.trim();
            break;
          case 'version_name':
            val = this.server.id;
            break;
          case 'game_directory':
            val = this.gameDir;
            break;
          case 'assets_root':
            val = path.join(this.commonDir, 'assets');
            break;
          case 'assets_index_name':
            val = this.versionData.assets;
            break;
          case 'auth_uuid':
            val = this.authUser.uuid.trim();
            break;
          case 'auth_access_token':
            val = this.authUser.accessToken;
            break;
          case 'user_type':
            val = 'mojang';
            break;
          case 'user_properties': // 1.8.9 and below.
            val = '{}';
            break;
          case 'version_type':
            val = this.versionData.type;
            break;
          default:
            // eslint-disable-next-line no-console
            console.warn(`Unknown argument: ${ident}`);
        }

        if (val) {
          arr[idx] = val;
        }
      }
    });

    // Autoconnect to selected server.
    if (this.minecraftConfig.autoConnect && this.server.autoconnect) {
      const serverUrl = new URL(`my://${this.server.address}`);
      mcArgs.push('--server');
      mcArgs.push(serverUrl.hostname);
      if (serverUrl.port) {
        mcArgs.push('--port');
        mcArgs.push(serverUrl.port);
      }
    }

    // Prepare game resolution
    if (this.minecraftConfig.fullScreen) {
      mcArgs.push('--fullscreen');
      mcArgs.push(true);
    } else {
      mcArgs.push('--width');
      mcArgs.push(this.minecraftConfig.resolution[0]);
      mcArgs.push('--height');
      mcArgs.push(this.minecraftConfig.resolution[1]);
    }

    return mcArgs;
  }

  classpathArg(mods, tempNativePath) {
    let cpArgs = [];

    // Add version.jar to classpath
    const version = this.versionData.id;
    cpArgs.push(path.join(this.commonDir, 'versions', version, `${version}.jar`));

    // Resolve Mojang Libraries
    const mojangLibs = this.resolveMojangLibraries(tempNativePath);

    // Resolve the server declared libraries.
    const servLibs = this.resolveServerLibraries(mods);

    // Merge libraries, server libs with the same
    // Maven identifier will override the mojang ones.
    // Ex. 1.7.10 forge overrides mojang's guava with newer version.
    const finalLibs = {
      ...mojangLibs,
      ...servLibs,
    };

    cpArgs = cpArgs.concat(Object.values(finalLibs));

    ProcessBuilder.processClassPathList(cpArgs);

    return cpArgs;
  }

  static processClassPathList(list) {
    const ext = '.jar';
    const extLen = ext.length;

    list.forEach((item, idx, arr) => {
      const extIndex = item.indexOf(ext);
      if (extIndex > -1 && extIndex !== item.length - extLen) {
        arr[idx] = item.substring(0, extIndex + extLen);
      }
    });
  }

  resolveMojangLibraries(tempNativePath) {
    const libs = {};

    const libArr = this.versionData.libraries;
    fs.ensureDirSync(tempNativePath);
    for (let i = 0; i < libArr.length; i += 1) {
      const lib = libArr[i];
      if (Library.validateRules(lib.rules, lib.natives)) {
        if (!lib.natives) {
          const dlInfo = lib.downloads;
          const { artifact } = dlInfo;
          const to = path.join(this.libPath, artifact.path);
          const versionIndependentId = lib.name.substring(0, lib.name.lastIndexOf(':'));
          libs[versionIndependentId] = to;
        } else {
          // Extract the native library.
          const exclusionArr = lib.extract != null ? lib.extract.exclude : ['META-INF/'];
          // eslint-disable-next-line no-template-curly-in-string
          const artifact = lib.downloads.classifiers[`natives-${Library.mojangFriendlyOs()}`];

          if (artifact) {
            // Location of native zip.
            const to = path.join(this.libPath, artifact.path);

            const zip = new AdmZip(to);
            const zipEntries = zip.getEntries();

            // Unzip the native zip.
            for (let i = 0; i < zipEntries.length; i += 1) {
              const fileName = zipEntries[i].entryName;

              let shouldExclude = false;

              // Exclude noted files.
              exclusionArr.forEach((exclusion) => {
                if (fileName.indexOf(exclusion) > -1) {
                  shouldExclude = true;
                }
              });

              // Extract the file.
              if (!shouldExclude) {
                // eslint-disable-next-line max-len
                fs.writeFile(path.join(tempNativePath, fileName), zipEntries[i].getData(), (err) => {
                  if (err) {
                    // eslint-disable-next-line no-console
                    console.error('Error while extracting native library:', err);
                  }
                });
              }
            }
          }
        }
      }
    }

    return libs;
  }

  resolveServerLibraries(mods) {
    let libs = {};

    // Locate Forge and Forge Libraries
    mods.forEach((mod) => {
      mod = new Module(null, null, mod);
      const { type } = mod;

      if (type === DistroTypes.ForgeHosted || type === DistroTypes.Library) {
        libs[mod.versionlessId()] = mod.artifact.path;

        if (mod.hasSubModules()) {
          const res = this.resolveModuleLibraries(mod);

          if (res.length > 0) {
            libs = {
              ...libs,
              ...res,
            };
          }
        }
      }
    });

    // Check for any libraries in our mod list.
    if (mods.subModules) {
      mods.forEach((mod) => {
        const res = this.resolveModuleLibraries(new Module(null, null, mod));

        if (res.length > 0) {
          libs = {
            ...libs,
            ...res,
          };
        }
      });
    }

    return libs;
  }

  resolveModuleLibraries(module) {
    module = new Module(null, null, module);
    let libs = [];

    module.subModules.forEach((mod) => {
      if (mod.type === DistroTypes.Library) {
        libs.push(mod.artifact.path);
      }

      // If this module has submodules, we need to resolve the libraries for those.
      // To avoid unnecessary recursive calls, base case is checked here.
      if (module.hasSubModules()) {
        const res = this.resolveModuleLibraries(mod);

        if (res.length > 0) {
          libs = libs.concat(res);
        }
      }
    });

    return libs;
  }
}
