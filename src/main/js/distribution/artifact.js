/**
 * Represents a file to be downloaded and validated
 * by the DistributionManager class
 *
 * @export
 * @class Artifact
 */
export default class Artifact {
  constructor(json) {
    if (!json) {
      throw new Error('Cannot instantiate class Artifact without an object');
    }

    this.size = json.size;
    this.MD5 = json.MD5;
    this.url = json.url;
    this.path = json.path || null;
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
    return this.MD5;
  }

  set hash(val) {
    this.MD5 = val.toLowerCase();
  }
}
