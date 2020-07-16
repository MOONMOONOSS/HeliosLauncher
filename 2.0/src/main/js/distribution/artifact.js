/**
 * Represents a file to be downloaded and validated
 * by the DistributionManager class
 *
 * @export
 * @class Artifact
 */
export default class Artifact {
  /**
   * Constructs a new Artifact object from a JSON object
   *
   * @static
   * @param {Object} json
   * @memberof Artifact
   *
   * @returns {Artifact} The newly constructed Artifact
   */
  static fromJson(json) {
    return Object.assign(new Artifact(), json);
  }

  /**
   * Gets the MD5 hash of the current Artifact.
   * This value may be unset, in which case validation would be skipped
   * for the Artifact.
   *
   * @readonly
   * @returns {string} The MD5 hash converted to lowercase (or null)
   * @memberof Artifact
   */
  get hash() {
    return this.hash ? this.hash.toLowerCase : null;
  }

  /**
   * Gets the download size of the current Artifact
   *
   * @readonly
   * @returns {number} The size in bytes of the Artifact
   * @memberof Artifact
   */
  get size() {
    return this.size;
  }

  /**
   * Gets the Url of the Artifact
   *
   * @readonly
   * @returns {string} The location at which the Artifact resides.
   * @memberof Artifact
   */
  get url() {
    return this.url;
  }

  /**
   * Gets the file path of the Artifact relative to the local working directory.
   *
   * @readonly
   * @returns {string} The file path where the Artifact will be placed.
   * @memberof Artifact
   */
  get path() {
    return this.path;
  }
}
