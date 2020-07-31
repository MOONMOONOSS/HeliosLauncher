import { app } from 'electron';
import ChildProcess from 'child_process';
import crypto from 'crypto';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

import DistroTypes from './distribution/types';

import Util from './assetGuard/util';
import { Library } from '../../../../1.0/app/assets/js/assetguard';
import AdmZip from 'adm-zip';

export default class ProcessBuilder {
  authUser;

  commonDir;

  forgeData;

  fmlDir;

  gameDir;

  launcherVersion;

  libPath;

  minecraftConfig;

  modConfig;

  optionalsConfig;

  javaConfig;

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
    minecraftConfig,
  ) {
    this.authUser = authUser;
    this.commonDir = app.getPath('appData');
    this.forgeData = forgeData;
    this.gameDir = path.join(this.commonDir, 'instances', distroServer.id);
    this.fmlDir = path.join(this.gameDir, 'forgeModList.json');
    this.javaConfig = javaConfig;
    this.launcherVersion = launcherVersion;
    this.libPath = path.join(this.commonDir, 'libraries');
    this.minecraftConfig = minecraftConfig;
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
    });

    return child;
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

  static constructModArgs(mods) {
    const argStr = mods.map((mod) => mod.extensionlessId())
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

    args.push(`-Xmx${this.javaConfig.maxRam}`);
    args.push(`-Xms${this.javaConfig.minRam}`);
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

    args.push(`-Xmx${this.javaConfig.maxRam}`);
    args.push(`-Xms${this.javaConfig.minRam}`);
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

    args.forEach((argument, argIdx, argArr) => {
      if (typeof argument === 'object' && argument.rules) {
        let checksum = 0;

        argument.rules.forEach((rule, ruleIdx, ruleArr) => {
          if (rule.os) {
            if (rule.os.name === Library.mojangFriendlyOS()
            && (rule.os.version ?? new RegExp(rule.os.version).test(os.release))) {
              if (rule.action === 'allow') checksum += 1;
            } else if (rule.action === 'disallow') checksum += 1;
          } else if (rule.features) {
            // We don't have many 'features' in the index at the moment.
            // This should be fine for a while.
            if (rule.features.has_custom_resolution
              && rule.features.has_custom_resolution) {
              if (this.minecraftConfig.fullScreen) {
                ruleArr[ruleIdx].values = [
                  '--fullscreen',
                  'true',
                ];
              }

              checksum += 1;
            }
          }
        });

        if (checksum === argument.rules.length) {
          if (typeof argument.value === 'string') {
            argArr[argIdx] = argument.value;
          } else if (typeof argument.value === 'object') {
            console.warn('SPLICING LAUNCH ARGS. THINGS ARE ABOUT TO GO VERY WRONG');
            args.splice(args.indexOf(argument), 1, ...argument.value);
          }
        } else {
          argArr[argIdx] = null;
        }
      } else if (typeof argument === 'string') {
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
              val = argument.replace(argDiscovery, tempNativePath);
              break;
            case 'launcher_name':
              val = argument.replace(argDiscovery, 'Helios-Launcher');
              break;
            case 'launcher_version':
              val = argument.replace(argDiscovery, this.launcherVersion);
              break;
            case 'classpath':
              val = this.classpathArg(mods, tempNativePath).join(process.platform === 'win32' ? ';' : ':');
              break;
            default:
              // eslint-disable-next-line no-console
              console.warn(`Unknown argument: ${ident}`);
          }

          if (val) {
            argArr[argIdx] = val;
          }
        }
      }
    });

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
    const mcArgs = this.forgeData.minecraftArguments.split(' ');
    const argDiscovery = /\${*(.*)}/;

    // Replace the declared variables with their proper values.
    mcArgs.forEach((argument, idx, arr) => {
      if (argDiscovery.text(argument)) {
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

    // Mod List File Arg
    mcArgs.push('--modListFile');
    if (this.belowOneSeven()) {
      mcArgs.push(path.basename(this.fmlDir));
    } else {
      mcArgs.push(`absolute:${this.fmlDir}`);
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
  }

  resolveMojangLibraries(tempNativePath) {
    const libs = {};
    const libArr = this.versionData.libraries;

    fs.ensureDirSync(tempNativePath);

    libArr.forEach((lib) => {
      if (Library.validateRules(lib.rules, lib.natives)) {
        if (!lib.natives) {
          const dlInfo = lib.downloads;
          const { artifact } = dlInfo;
          const to = path.join(this.libPath, artifact.path);
          const versionIndependentId = lib.name.substring(0, lib.name.lastIndexOf(':'));
          libs[versionIndependentId] = to;
        } else {
          // Extract the native library.
          const exclusionArr = lib.extract ? lib.extract.exclude : ['META-INF/'];
          const artifact = lib.downloads.classifiers[
            lib.natives[Library.mojangFriendlyOS()]
              // eslint-disable-next-line no-template-curly-in-string
              .replace('${arch}', process.arch.replace('x', ''))
          ];

          // Location of native zip
          const to = path.join(this.libPath, artifact.path);

          const zip = new AdmZip(to);
          const zipEntries = zip.getEntries();

          // Unzip the native zip
          zipEntries.forEach((entry) => {
            const fileName = entry.entryName;

            let shouldExclude = false;

            exclusionArr.forEach((exclusion) => {
              if (fileName.indexOf(exclusion) > -1) {
                shouldExclude = true;
              }
            });

            // Extract the file
            if (!shouldExclude) {
              fs.writeFile(path.join(tempNativePath, fileName), entry.getData(), (err) => {
                if (err) {
                  console.error('Error while extracting native library', err);
                }
              });
            }
          });
        }
      }
    });
  }
}
