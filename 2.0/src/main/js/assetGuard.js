// @flow

import AdmZip from 'adm-zip';
import Crypto from 'crypto';
import EventEmitter from 'events';
import fs from 'fs';

import DlTracker from './assetGuard/downloadTracker';

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
  totalDlSize: number;

  progress: number;

  assets: DlTracker;

  libraries: DlTracker;

  files: DlTracker;

  forge: DlTracker;

  java: DlTracker;

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
}
