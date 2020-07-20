// @flow

/* eslint-disable no-loop-func */

import EventEmitter from 'events';
import Registry from 'winreg';
import childProcess from 'child_process';
import fs from 'fs';
import fetchNode from 'node-fetch';
import path from 'path';

import Util from './util';

type OpenJdkData = {
  uri: string,
  size: number,
  name: string,
};

type JavaVersion8 = {|
  build: number,
  update: number,
  major: number,
|};

type JavaVersion9 = {|
  build: number,
  major: number,
  minor: number,
  revision: number,
|};

export default class JavaGuard extends EventEmitter {
  mcVersion: string;

  static baseOpenJdk: string = 'https://api.adoptopenjdk.net/v2/latestAssets/nightly/openjdk';

  static mojangLauncherMeta: string = 'https://launchermeta.mojang.com/mc/launcher.json';

  // Keys for Java 1.8 and prior:
  static REG_KEYS: Array<string> = [
    '\\SOFTWARE\\JavaSoft\\Java Runtime Environment',
    '\\SOFTWARE\\JavaSoft\\Java Development Kit',
  ];

  constructor(mcVersion: string) {
    super();
    this.mcVersion = mcVersion;
  }

  /**
   * Fetch the lastest OpenJDK binary. Uses https://api.adoptopenjdk.net/
   *
   * @static
   * @param {string} [major='8'] The major version of Java to fetch.
   * @returns {Promise<OpenJdkData>}
   * @memberof JavaGuard
   */
  static latestOpenJdk(major: string = '8'): Promise<OpenJdkData> {
    let sanitizedOs: string;
    switch (process.platform) {
      case 'win32':
        sanitizedOs = 'windows';
        break;
      case 'darwin':
        sanitizedOs = 'mac';
        break;
      case 'linux':
        sanitizedOs = process.platform;
        break;
      default:
        sanitizedOs = 'unknown_os';
    }

    const url = `${JavaGuard.baseOpenJdk}${major}?os=${sanitizedOs}&arch=x64&heap_size=normal&openjdk_impl=hotspot&type=jre`;

    const params: any = {
      method: 'GET',
      cache: 'no-cache',
      timeout: 3000,
    };

    return new Promise((resolve, reject) => {
      fetchNode(url, params)
        .then((res) => {
          if (res.status !== 200) {
            reject(res);
          }

          return res.json();
        })
        .then((data) => {
          resolve({
            uri: data[0].binary_link,
            size: data[0].binary_size,
            name: data[0].binary_name,
          });
        });
    });
  }

  /**
   * Returns the path of the OS-specific executable for the given Java
   * installation. Supported OS's are win32, darwin, linux.
   *
   * @static
   * @param {string} rootDir The root directory of the Java installation.
   * @returns {string}
   * @memberof JavaGuard
   */
  static javaExecFromRoot(rootDir: string): string {
    switch (process.platform) {
      case 'win32':
        return path.join(rootDir, 'bin', 'javaw.exe');
      case 'darwin':
        return path.join(rootDir, 'Contents', 'Home', 'bin', 'java');
      case 'linux':
        return path.join(rootDir, 'bin', 'java');
      default:
        return rootDir;
    }
  }

  /**
   * Check to see if the given path points to a Java executable.
   *
   * @static
   * @param {string} pth The path to check against.
   * @returns {boolean} True if the path points to a Java executable, otherwise false.
   * @memberof JavaGuard
   */
  static isJavaExecPath(pth: string): boolean {
    switch (process.platform) {
      case 'win32':
        return pth.endsWith(path.join('bin', 'javaw.exe'));
      case 'darwin':
      case 'linux':
        return pth.endsWith(path.join('bin', 'java'));
      default:
        return false;
    }
  }

  /**
   * Load Mojang's launcher.json file.
   *
   * @static
   * @returns {Promise<any>} Promise which resolves to Mojang's launcher.json object.
   * @memberof JavaGuard
   */
  static fetchMojangLauncherData(): Promise<any> {
    return new Promise((resolve) => {
      const params: any = {
        method: 'GET',
        cache: 'no-cache',
        timeout: 3000,
      };

      fetchNode(JavaGuard.mojangLauncherMeta, params)
        .then((res) => res.json())
        .then((data) => resolve(data));
    });
  }

  /**
   * Parses a **full** Java Runtime version string and resolves
   * the version information. Dynamically detects the formatting
   * to use.
   *
   * @static
   * @param {string} verString Full version string to parse.
   * @returns {any} Object containing the version information.
   * @memberof JavaGuard
   */
  static javaRuntimeVersion(verString: string): any {
    const [major] = verString.split('.');

    if (Number(major) === 1) {
      return JavaGuard.javaRuntimeVersion8(verString);
    }

    return JavaGuard.javaRuntimeVersion9(verString);
  }

  /**
   * Parses a **full** Java Runtime version string and resolves
   * the version information. Uses Java 8 formatting.
   *
   * @static
   * @param {string} verString Full version string to parse.
   * @returns {JavaVersion8} Object containing the version information.
   * @memberof JavaGuard
   */
  static javaRuntimeVersion8(verString: string): JavaVersion8 {
    // 1.{major}.0_{update}-b{build}
    // ex. 1.8.0_152-b16

    const returnObj: any = {};
    let parts = verString.split('-');

    returnObj.build = parseInt(parts[1].substring(1), 10);

    parts = parts[0].split('_');

    returnObj.update = parseInt(parts[1], 10);
    returnObj.major = parseInt(parts[0].split('.')[1], 10);

    return returnObj;
  }

  /**
   * Parses a **full** Java Runtime version string and resolves
   * the version information. Uses Java 9+ formatting.
   *
   * @static
   * @param {string} verString Full version string to parse.
   * @returns {JavaVersion9} Object containing the version information.
   * @memberof JavaGuard
   */
  static javaRuntimeVersion9(verString: string): JavaVersion9 {
    const returnObj: any = {};
    let parts = verString.split('+');

    returnObj.build = parseInt(parts[1], 10);

    parts = parts[0].split('.');

    returnObj.major = parseInt(parts[0], 10);
    returnObj.minor = parseInt(parts[1], 10);
    returnObj.revision = parseInt(parts[2], 10);

    return returnObj;
  }

  /**
   * Checks for the presence of the environment variable JAVA_HOME. If it exits, we will check
   * to see if the value points to a path which exists. If the path exits, the path is returned.
   *
   * @static
   * @returns {?string} The path defined by JAVA_HOME, if it exists. Otherwise null.
   * @memberof JavaGuard
   */
  static scanJavaHome(): ?string {
    const jHome = String(process.env.JAVA_HOME);
    try {
      return fs.existsSync(jHome) ? jHome : null;
    } catch (err) {
      // Malformed JAVA_HOME property
      return null;
    }
  }

  /**
   * Scans the registry for 64-bit Java entries. The paths of each entry are added to
   * a set and returned. Currently, only Java 8 (1.8) is supported.
   *
   * @static
   * @returns {Promise<Set<string>>} A promise which resolves to a set of 64-bit Java root
   * paths found in the registry.
   * @memberof JavaGuard
   */
  static scanRegistry(): Promise<Set<string>> {
    return new Promise((resolve) => {
      // Keys for Java v9.0.0 and later:
      // 'SOFTWARE\\JavaSoft\\JRE'
      // 'SOFTWARE\\JavaSoft\\JDK'
      let keysDone = 0;

      const candidates = new Set();

      for (let i = 0; i < JavaGuard.REG_KEYS.length; i += 1) {
        const key = new Registry({
          hive: Registry.HKLM,
          key: JavaGuard.REG_KEYS[i],
          arch: 'x64',
        });

        key.keyExists((err, exists) => {
          if (exists) {
            key.keys((err, javaVersion) => {
              if (err) {
                keysDone += 1;

                console.error(err);

                // Stop early due to error
                if (keysDone === JavaGuard.REG_KEYS.length) {
                  resolve(candidates);
                }
              }
              let numDone = 0;

              for (let j = 0; j < javaVersion.length; j += 1) {
                const javaVer = javaVersion[j];
                const vKey = javaVer.key.substring(javaVer.key.lastIndexOf('\\') + 1);

                if (parseFloat(vKey) === 1.8) {
                  javaVer.get('JavaHome', (_err, res) => {
                    const jHome = res.value;

                    if (jHome.indexOf('(x86)') === -1) {
                      candidates.add(jHome);
                    }

                    // Subkey done

                    numDone += 1;

                    if (numDone === javaVersion.length) {
                      keysDone += 1;

                      if (keysDone === JavaGuard.REG_KEYS.length) {
                        resolve(candidates);
                      }
                    }
                  });
                } else {
                  // Not Java 8
                  numDone += 1;

                  if (numDone === javaVersion.length) {
                    keysDone += 1;

                    if (keysDone === JavaGuard.REG_KEYS.length) {
                      resolve(candidates);
                    }
                  }
                }
              }
            });
          }
        });
      }
    });
  }

  /**
   * Validates the output of a JVM's properties. Currently validates that a JRE is x64
   * and that the major = 8, update > 52.
   *
   * @static
   * @param {string} stderr The output to validate.
   * @returns {Promise<any>} A promise which resolves to a meta object about the JVM.
   * The validity is stored inside the `valid` property.
   * @memberof JavaGuard
   */
  validateJvmProperties(stderr: string): Promise<any> {
    return new Promise((resolve) => {
      const props = stderr.split('\n');
      const GOAL = 2;

      let checksum = 0;

      const meta: any = {};

      for (let i = 0; i < props.length; i += 1) {
        if (props[i].indexOf('sun.arch.data.model') > -1) {
          const arch = parseInt(props[i].split('=')[1].trim(), 10);
          console.log(props[i].trim());

          if (arch === 64) {
            meta.arch = arch;

            checksum += 1;
          }
        } else if (props[i].indexOf('java.runtime.version') > -1) {
          const verString = props[i].split('=')[1].trim();
          console.log(props[i].trim());

          const verObj = JavaGuard.javaRuntimeVersion(verString);

          if (verObj.major < 9) {
            // Java 8
            if (verObj.major === 8 && verObj.update > 52) {
              meta.version = verObj;

              checksum += 1;
            }
          } else if (Util.mcVersionAtLeast('1.13', this.mcVersion)) {
            // Java 9+
            console.warn('Java 9+ not yet tested');
          }
        }

        if (checksum === GOAL) {
          break;
        }
      }

      meta.valid = checksum === GOAL;

      resolve(meta);
    });
  }

  /**
   * Validates that a Java binary is at least 64 bit. This makes use of the non-standard
   * command line option -XshowSettings:properties. The output of this contains a property,
   * sun.arch.data.model = ARCH, in which ARCH is either 32 or 64. This option is supported
   * in Java 8 and 9. Since this is a non-standard option. This will resolve to true if
   * the function's code throws errors. That would indicate that the option is changed or
   * removed.
   *
   * @static
   * @param {string} binaryExecPath Path to the java executable we wish to validate.
   * @returns {Promise<any>} A promise which resolves to a meta object about the JVM.
   * The validity is stored inside the `valid` property.
   * @memberof JavaGuard
   */
  validateJavaBinary(binaryExecPath: string): Promise<any> {
    return new Promise((resolve) => {
      if (!JavaGuard.isJavaExecPath(binaryExecPath)) {
        resolve({
          valid: false,
        });
      } else if (fs.existsSync(binaryExecPath)) {
        // javaw.exe no longer outputs this information
        // so we use java.exe instead
        if (binaryExecPath.indexOf('javaw.exe') > -1) {
          binaryExecPath.replace('javaw.exe', 'java.exe');
        }

        childProcess.exec(`"${binaryExecPath}" -XshowSettings:properties`, (err, stdout, stderr) => {
          try {
            // pee is stored in the stderr?
            resolve(this.validateJvmProperties(stderr));
          } catch (err) {
            resolve({
              valid: false,
            });
          }
        });
      } else {
        resolve({
          valid: false,
        });
      }
    });
  }
}
