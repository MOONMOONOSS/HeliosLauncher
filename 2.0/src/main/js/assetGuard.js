// @flow

import AdmZip from 'adm-zip';
import ChildProcess from 'child_process';
import Crypto from 'crypto';
import EventEmitter from 'events';
import async from 'async';
import fetchNode from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';

import Asset from './assetGuard/asset';
import DlTracker from './assetGuard/downloadTracker';
import DistroModule from './assetGuard/distroModule';
import Library from './assetGuard/library';
import Util from './assetGuard/util';

import Types as DistroTypes from './distribution/types';
import Module from './distribution/module';
import Server from './distribution/server';

/**
 * Central object class used for control flow. This object stores data about
 * categories of downloads. Each category is assigned an identifier with a
 * DLTracker object as its value. Combined information is also stored, such as
 * the total size of all the queued files in each category. This event is used
 * to emit events so that external modules can listen into processing done in
 * this module.
 *
 * @export
 * @class AssetGuard
 * @extends {EventEmitter}
 */
export default class AssetGuard extends EventEmitter {
  static manifestUrl: string = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';

  static resourceUrl: string = 'http://resources.download.minecraft.net/';

  totalDlSize: number;

  progress: number;

  assets: DlTracker<Asset>;

  libraries: DlTracker<Library>;

  files: DlTracker<Asset>;

  forge: DlTracker<DistroModule>;

  java: DlTracker<Asset>;

  extractQueue: Array<any>;

  commonPath: string;

  javaExec: string;

  /**
   * Creates an instance of AssetGuard.
   * On creation the object's properties are never-null default
   * values. Each identifier is resolved to an empty DLTracker.
   *
   * @param {string} commonPath The common path for shared game files.
   * @param {string} javaExec The path to a java executable which will be used
   * to finalize installation.
   * @memberof AssetGuard
   */
  constructor(commonPath: string, javaExec: string) {
    super();

    this.totalDlSize = 0;
    this.progress = 0;
    this.assets = new DlTracker([], 0);
    this.libraries = new DlTracker([], 0);
    this.files = new DlTracker([], 0);
    this.forge = new DlTracker([], 0);
    this.java = new DlTracker([], 0);
    this.extractQueue = [];
    this.commonPath = commonPath;
    this.javaExec = javaExec;
  }

  /**
   * Calculates the hash for a file using the specified algorithm.
   *
   * @static
   * @param {Buffer} buf The buffer containing file data.
   * @param {string} algo The hash algorithm.
   * @returns {string} The calculated hash in hex.
   * @memberof AssetGuard
   */
  static calculateHash(buf: Buffer, algo: string): string {
    return Crypto.createHash(algo)
      .update(buf)
      .digest('hex');
  }

  /**
   * Extracts and unpacks a file from .pack.xz format.
   *
   * @static
   * @param {Array<string>} filePaths The paths of the files to be extracted and unpacked.
   * @param {string} javaExe Path to Java executable
   * @returns {Promise<void>} An empty promise to indicate the extraction has completed.
   * @memberof AssetGuard
   */
  static extractPackXZ(filePaths: Array<string>, javaExe: string): Promise<void> {
    return new Promise((resolve) => {
      let libPath: string;

      if (process.platform === 'darwin') {
        libPath = path.join(process.cwd(), 'Contents', 'Resources', 'libraries', 'java', 'PackXZExtract.jar');
      } else {
        libPath = path.join(process.cwd(), 'resources', 'libraries', 'java', 'PackXZExtract.jar');
      }

      const filePath = filePaths.join(',');
      const child = ChildProcess.spawn(javaExe, [
        '-jar',
        libPath,
        '-packxz',
        filePath,
      ]);

      child.on('close', (code: number) => {
        console.log('[PackXZExtract]', 'Exited with code', code);

        resolve();
      });
    });
  }

  /**
   * Function which finalizes the forge installation process. This creates a 'version'
   * instance for forge and saves its version.json file into that instance. If that
   * instance already exists, the contents of the version.json file are read and returned
   * in a promise.
   *
   * @static
   * @param {Asset} asset The Asset object representing Forge.
   * @param {string} commonPath The common path for shared game files.
   * @returns {Promise<Object>} A promise which resolves to the contents of forge's version.json.
   * @memberof AssetGuard
   */
  static finalizeForgeAsset(asset: Asset, commonPath: string): Promise<Object> {
    return new Promise((resolve, reject) => {
      fs.readFile(asset.to, (err, data) => {
        if (err) {
          throw new Error(err);
        }

        const zip = new AdmZip(data);
        const zipEntries = zip.getEntries();

        for (let i = 0; i < zipEntries.length; i += 1) {
          if (zipEntries[i].entryName === 'version.json') {
            const forgeVersion = JSON.parse(zip.readAsText(zipEntries[i]));
            const versionPath = path.join(commonPath, 'versions', forgeVersion.id);
            const versionFile = path.join(versionPath, `${forgeVersion.id}.json`);

            if (!fs.existsSync(versionFile)) {
              fs.ensureDirSync(versionPath);
              fs.writeFileSync(path.join(versionPath, `${forgeVersion.id}.json`), zipEntries[i].getData());

              resolve(forgeVersion);
            }

            // Read the saved file to allow for user modifications.
            resolve(JSON.parse(fs.readFileSync(versionFile, 'utf-8')));

            break;
          }
        }

        // We didn't find Forge's version.json
        reject(Error('Unable to finalize Forge processing, version.json not found! Has forge changed their format?'));
      });
    });
  }

  /**
   * Used to parse a checksums file. This is specifically designed for
   * the checksums.sha1 files found inside the forge scala dependencies.
   *
   * @static
   * @param {string} content The string content of the checksums file.
   * @returns {Object} An object with keys being the file names, and values being the hashes.
   * @memberof AssetGuard
   */
  static parseChecksumsFile(content: string): Object {
    const finalContent: Object = {};
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i += 1) {
      const bits = lines[i].split(' ');

      if (bits[1]) {
        finalContent[bits[1]] = bits[0];
      }
    }

    return finalContent;
  }

  /**
   * Validate that a file exists and matches a given hash value.
   *
   * @static
   * @param {string} filePath The path of the file to validate.
   * @param {string} algo The hash algorithm to check against.
   * @param {?string} hash The existing hash to check against.
   * @returns {boolean} True if the file exists and calculated
   * hash matches the given hash, otherwise false.
   * @memberof AssetGuard
   */
  static validateLocal(filePath: string, algo: string, hash: ?string): boolean {
    if (fs.existsSync(filePath)) {
      // No hash provided, assume it is valid
      if (!hash) {
        return true;
      }

      const buf = fs.readFileSync(filePath);
      const calcHash = AssetGuard.calculateHash(buf, algo);

      return calcHash === hash;
    }

    return false;
  }

  /**
   * Validates a file in the style used by forge's version index.
   *
   * @static
   * @param {string} filePath The path of the file to validate.
   * @param {?Array<string>} checksums The checksums listed in the forge version index.
   * @returns {boolean} True if the file exists and the hashes match, otherwise false.
   * @memberof AssetGuard
   */
  static validateForgeChecksum(filePath: string, checksums: ?Array<string>): boolean {
    if (fs.existsSync(filePath)) {
      if (!checksums || checksums.length === 0) {
        return true;
      }

      const buf = fs.readFileSync(filePath);
      const calcHash = AssetGuard.calculateHash(buf, 'sha1');
      let valid = checksums.includes(calcHash);

      if (!valid && filePath.endsWith('.jar')) {
        valid = AssetGuard.validateForgeJar(Buffer.from(filePath), checksums);
      }

      return valid;
    }

    return false;
  }

  /**
   * Validates a forge jar file dependency who declares a checksums.sha1 file.
   * This can be an expensive task as it usually requires that we calculate thousands
   * of hashes.
   *
   * @static
   * @param {Buffer} buf The buffer of the jar file.
   * @param {Array<string>} checksums The checksums listed in the forge version index.
   * @returns {boolean} True if all hashes declared in the checksums.sha1 file
   * match the actual hashes.
   * @memberof AssetGuard
   */
  static validateForgeJar(buf: Buffer, checksums: Array<string>): boolean {
    // Double pass method was the quickest I found. I tried a version where we store data
    // to only require a single pass, plus some quick cleanup
    // but that seemed to take slightly more time.

    const hashes: Object = {};
    let expected: Object = {};

    const zip = new AdmZip(buf);
    const zipEntries = zip.getEntries();

    for (let i = 0; i < zipEntries.length; i += 1) {
      const entry = zipEntries[i];

      if (entry.entryName === 'checksums.sha1') {
        expected = AssetGuard.parseChecksumsFile(zip.readAsText(entry));
      }

      hashes[entry.entryName] = AssetGuard.calculateHash(entry.getData(), 'sha1');
    }

    if (!checksums.includes(hashes['checksums.sha1'])) {
      return false;
    }

    const expectedEntries = Object.keys(expected);

    // Check against expected
    for (let i = 0; i < expectedEntries.length; i += 1) {
      if (expected[expectedEntries[i]] !== hashes[expectedEntries[i]]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Parses Mojang's version manifest and retrieves the url of the version
   * data index.
   *
   * @static
   * @param {string} version The version to lookup.
   * @returns {Promise<?string>} Promise which resolves to the url of the version data index.
   * If the version could not be found, resolves to null.
   * @memberof AssetGuard
   */
  static getVersionDataUrl(version: string): Promise<?string> {
    return new Promise((resolve, reject) => {
      fetchNode(AssetGuard.manifestUrl)
        .then((res) => {
          if (res.status !== 200) {
            reject(Error(res.statusText));
          }

          const manifest = res.json();

          manifest.versions.forEach((ver) => {
            if (ver.id === version) {
              resolve(ver.url);
            }
          });

          resolve(null);
        });
    });
  }

  /**
   * Used to chain the asset validation process. This function retrieves
   * the index data.
   *
   * @param {Object} versionData
   * @param {boolean} [force]
   * @returns {Promise<void>} An empty promise to indicate the async processing has completed.
   * @memberof AssetGuard
   */
  assetChainIndexData(versionData: Object, force?: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const { assetIndex } = versionData;
      const name = `${assetIndex.id}.json`;
      const indexPath = path.join(this.commonPath, 'assets', 'indexes');
      const assetIndexLoc = path.join(indexPath, name);

      if (!fs.existsSync(assetIndexLoc) || force) {
        console.log(`Download ${versionData.id} asset index.`);
        fs.ensureDirSync(indexPath);
        const stream = fetchNode(assetIndex.url)
          .then((res) => {
            if (res.status !== 200) {
              reject(Error(res.statusText));
            }

            const dest = fs.createWriteStream(assetIndexLoc);

            return res.body.pipe(dest);
          });
        stream.on('finish', () => {
          const data = JSON.parse(fs.readFileSync(assetIndexLoc, 'utf-8'));
          this.assetChainValidateAssets(versionData, data)
            .then(() => resolve());
        });
      }

      const data = JSON.parse(fs.readFileSync(assetIndexLoc, 'utf-8'));
      this.assetChainValidateAssets(versionData, data)
        .then(() => resolve());
    });
  }

  /**
   * Used to chain the asset validation process. This function processes
   * the assets and enqueues missing or invalid files.
   *
   * @param {Object} versionData
   * @param {Object} indexData
   * @returns {Promise<void>} An empty promise to indicate the async processing has completed.
   * @memberof AssetGuard
   */
  assetChainValidateAssets(versionData: Object, indexData: Object): Promise<void> {
    return new Promise((resolve) => {
      const localPath = path.join(this.commonPath, 'assets');
      const objectPath = path.join(localPath, 'objects');
      const assetDlQueue: Array<Asset> = [];
      const total = Object.keys(indexData.objects).length;

      let dlSize = 0;
      let acc = 0;

      async.forEachOfLimit(indexData.objects, 10, (value, key, cb) => {
        acc += 1;

        this.emit('progress', 'assets', acc, total);

        const { hash } = value.hash;
        const assetName = path.join(hash.substring(0, 2), hash);
        const urlName = `${hash.substring(0, 2)}/${hash}`;
        const ast = new Asset(
          key,
          hash,
          value.size,
          `${AssetGuard.resourceUrl}${urlName}`,
          path.join(objectPath, assetName),
        );

        if (!AssetGuard.validateLocal(ast.to, 'sha1', ast.hash)) {
          dlSize += (ast.size * 1);
          assetDlQueue.push(ast);
        }

        cb();
      }, () => {
        this.assets = new DlTracker(assetDlQueue, dlSize);

        resolve();
      });
    });
  }

  /**
   * Loads Forge's version.json data into memory for the specified server id.
   *
   * @param {Server} server The Server to load Forge data for.
   * @returns {Promise<?Object>} A promise which resolves to Forge's version.json data.
   * @memberof AssetGuard
   */
  loadForgeData(server: Server): Promise<?Object> {
    return new Promise((resolve, reject) => {
      const modules = server.modules;

      modules.forEach((mod) => {
        const { type } = mod;

        if (type === DistroTypes.ForgeHosted || type === DistroTypes.Forge) {
          if (Util.isForgeGradle3(server.minecraftVersion, mod.version)) {
            const found = mod.subModules.find((el) => el.type === DistroTypes.VersionManifest);

            if (found) {
              resolve(
                JSON.parse(
                  fs.readFileSync(
                    found.artifact.path,
                    'utf-8',
                  ),
                ),
              );
            } else {
              console.warn('No forge version manifest found! Assuming we are running vanilla.');
              resolve(null);
            }
          }

          const modArtifact = mod.artifact;
          const modPath = modArtifact.path;
          const asset = new DistroModule(
            mod.id,
            modArtifact.hash,
            modArtifact.size,
            modArtifact.url,
            modPath,
            type,
          );

          AssetGuard.finalizeForgeAsset(asset, this.commonPath)
            .then((forgeData) => resolve(forgeData))
            .catch((err) => reject(err));
        }
      });

      console.warn('No forge module found! Assuming we are running vanilla...');
      resolve(null);
    });
  }

  /**
   * Loads the version data for a given minecraft version.
   *
   * @param {string} version The game version for which to load the index data.
   * @param {boolean} [force] Forces the version index to be downloaded even if it exists.
   * @returns {Promise<Object>} Promise which resolves to the version data object.
   * @memberof AssetGuard
   */
  loadVersionData(version: string, force?: boolean): Promise<Object> {
    const versionPath = path.join(this.commonPath, 'versions', version);

    return new Promise((resolve) => {
      const versionFile = path.join(versionPath, `${version}.json`);

      if (!fs.existsSync(versionFile) || force) {
        AssetGuard.getVersionDataUrl(version)
          .then((url) => {
            console.log(`Preparing download of ${version} assets.`);
            fs.ensureDirSync(versionPath);

            const stream = fetchNode(url)
              .then((res) => {
                const dest = fs.createWriteStream(versionFile);

                return res.body.pipe(dest);
              });
            stream.on('finish', () => {
              resolve(JSON.parse(fs.readFileSync(versionFile)));
            });
          });
      }

      resolve(JSON.parse(fs.readFileSync(versionFile)));
    });
  }

  /**
   * Recursively parses an array of modules for a given distribution
   *
   * @param {Array<Module>} modules The array of modules to parse recursively
   * @param {string} version The version of the distribution
   * @param {string} id The server ID
   * @returns {DlTracker<DistroModule>} The Download Tracker for this distribution's modules.
   * @memberof AssetGuard
   */
  parseDistroModules(modules: Array<Module>, version: string, id: string): DlTracker<DistroModule> {
    let list: Array<DistroModule> = [];

    let size = 0;

    modules.forEach((mod) => {
      const modArtifact = mod.artifact;
      const modPath = modArtifact.path;
      const artifact = new DistroModule(
        mod.id,
        modArtifact.hash,
        modArtifact.size,
        modArtifact.url,
        modPath,
        mod.type,
      );
      const validationPath = modPath
        .toLowerCase()
        .endsWith('.pack.xz')
        ? modPath.substring(
          0,
          modPath
            .toLowerCase()
            .lastIndexOf('.pack.xz'),
        )
        : modPath;
      if (!AssetGuard.validateLocal(validationPath, 'MD5', artifact.hash)) {
        size += artifact.size * 1;
        list.push(artifact);

        if (validationPath !== modPath) {
          this.extractQueue.push(modPath);
        }
      }

      // Recursively process the submodules then combine the results.
      if (mod.subModules) {
        const dlTrack = this.parseDistroModules(mod.subModules, version, id);
        size += dlTrack.dlSize * 1;
        list = list.concat(dlTrack.dlQueue);
      }
    });

    return new DlTracker<DistroModule>(list, size);
  }

  /**
   * Public asset validation function. This function will handle the validation of assets.
   * It will parse the asset index specified in the version data, analyzing each
   * asset entry. In this analysis it will check to see if the local file exists and is valid.
   * If not, it will be added to the download queue for the 'assets' identifier.
   *
   * @param {Object} versionData The version data for the assets.
   * @param {boolean} [force] Forces the asset to be redownloaded.
   * @returns {Promise<void>} An empty promise to indicate the async processing has completed.
   * @memberof AssetGuard
   */
  validateAssets(versionData: Object, force?: boolean): Promise<void> {
    return new Promise((resolve) => {
      this.assetChainIndexData(versionData, force)
        .then(() => resolve());
    });
  }

  /**
   *
   *
   * @param {Object} versionData
   * @param {boolean} [force]
   * @returns {Promise<void>}
   * @memberof AssetGuard
   */
  validateClient(versionData: Object, force?: boolean): Promise<void> {
    return new Promise((resolve) => {
      const clientData = versionData.downloads.client;
      const version = versionData.id;
      const targetPath = path.join(this.commonPath, 'versions', version);
      const targetFile = `${version}.jar`;
      const client = new Asset(
        `${version} client`,
        clientData.sha1,
        clientData.size,
        clientData.url,
        path.join(targetPath, targetFile),
      );

      if (!AssetGuard.validateLocal(client.to, 'sha1', client.hash) || force) {
        this.files.dlQueue.push(client);
        this.files.dlSize += client.size * 1;

        resolve();
      }

      resolve();
    });
  }

  /**
   * Validate the given server's distribution.
   *
   * @param {Server} server The Server to validate.
   * @returns {Promise<Server>} A promise which resolves to the server distribution object.
   * @memberof AssetGuard
   */
  validateDistribution(server: Server): Promise<Server> {
    return new Promise((resolve) => {
      this.forge = this.parseDistroModules(
        server.modules,
        server.minecraftVersion,
        server.id,
      );

      resolve(server);
    });
  }

  /**
   * Public library validation function. This function will handle the validation of libraries.
   * It will parse the version data, analyzing each library entry. In this analysis, it will
   * check to see if the local file exists and is valid. If not, it will be added to the download
   * queue for the 'libraries' identifier.
   *
   * @param {Object} versionData The version data for the assets.
   * @returns {Promise<void>} An empty promise to indicate the async processing has completed.
   * @memberof AssetGuard
   */
  validateLibraries(versionData: Object): Promise<void> {
    return new Promise((resolve) => {
      const libArr: Array<Object> = versionData.libraries;
      const libPath = path.join(this.commonPath, 'libraries');
      const libDlQueue: Array<Library> = [];

      let dlSize = 0;

      async.eachLimit(libArr, 5, (lib, cb) => {
        if (Library.validateRules(lib.rules, lib.natives)) {
          const artifact = (lib.natives)
            ? lib.downloads.artifact
            : lib.downloads.classifiers[
              lib.natives[
                Library.mojangFriendlyOs()
              ].replace('${arch}', process.arch.replace('x', ''))
            ];
          const libItm = new Library(
            lib.name,
            artifact.sha1,
            artifact.size,
            artifact.url,
            path.join(libPath, artifact.path),
          );

          if (!AssetGuard.validateLocal(libItm.to, 'sha1', libItm.hash)) {
            dlSize += (libItm.size * 1);

            libDlQueue.push(libItm);
          }
        }

        cb();
      }, () => {
        this.libraries = new DlTracker(libDlQueue, dlSize);

        resolve();
      });
    });
  }

  /**
   * Validate log config.
   *
   * @param {Object} versionData The version data for the assets.
   * @returns {Promise<void>} An empty promise to indicate the async processing has completed.
   * @memberof AssetGuard
   */
  validateLogConfig(versionData: Object): Promise<void> {
    return new Promise((resolve) => {
      const { client } = versionData.logging;
      const { file } = client;
      const targetPath = path.join(this.commonPath, 'assets', 'log_configs');
      const logConfig = new Asset(
        file.id,
        file.sha1,
        file.size,
        file.url,
        path.join(targetPath, file.id),
      );

      if (!AssetGuard.validateLocal(logConfig.to, 'sha1', logConfig.hash)) {
        this.files.dlQueue.push(logConfig);
        this.files.dlSize += logConfig.size * 1;

        resolve();
      }

      resolve();
    });
  }

  /**
   * Public miscellaneous mojang file validation function. These files will be enqueued under
   * the 'files' identifier.
   *
   * @param {Object} versionData The version data for the assets.
   * @returns {Promise<void>} An empty promise to indicate the async processing has completed.
   * @memberof AssetGuard
   */
  validateMiscellaneous(versionData: Object): Promise<void> {
    return new Promise((resolve) => {
      this.validateClient(versionData);
      this.validateLogConfig(versionData);

      resolve();
    });
  }
}
