// @flow

/**
 * Utility functions used in AssetGuard
 *
 * @export
 * @class Util
 */
export default class Util {
  /**
   * Returns true if the actual version is greater than
   * or equal to the desired version.
   *
   * @static
   * @param {string} desired
   * @param {string} actual
   * @returns {boolean}
   * @memberof Util
   */
  static mcVersionAtLeast(desired: string, actual: string): boolean {
    const des = desired.split('.');
    const act = actual.split('.');

    for (let i = 0; i < des.length; i += 1) {
      if (!(parseInt(act[i], 10) >= parseInt(des[i], 10))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks if Forge is using Gradle 2 or 3
   * since Gradle 3 has changed how versions are handled.
   *
   * @static
   * @param {string} mcVersion
   * @param {string} forgeVersion
   * @returns {boolean}
   * @memberof Util
   */
  static isForgeGradle3(mcVersion: string, forgeVersion: string): boolean {
    if (Util.mcVersionAtLeast('1.13', mcVersion)) {
      return true;
    }

    let forgeVer: string;

    try {
      [, forgeVer] = forgeVersion.split('-');
    } catch (err) {
      throw new Error('Forge version is unknown. Perhaps Forge has broken something?');
    }

    const maxGradle2: Array<number> = [14, 23, 5, 2847];
    const verSplit = forgeVer.split('.')
      .map((v) => Number(v));

    for (let i = 0; i < maxGradle2.length; i += 1) {
      if (verSplit[i] > maxGradle2[i]) {
        return true;
      }
    }

    return false;
  }
}
