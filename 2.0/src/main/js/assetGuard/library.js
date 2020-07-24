import Asset from './asset';

/**
 * Represents a Mojang library asset
 *
 * @export
 * @class Library
 * @extends {Asset}
 */
export default class Library extends Asset {
  /**
   * Converts process.platform OS names to match
   * Mojang's OS naming standards
   *
   * @static
   * @returns {string}
   * @memberof Library
   */
  static mojangFriendlyOs() {
    const system = process.platform;

    switch (system) {
      case 'darwin':
        return 'osx';
      case 'win32':
        return 'windows';
      case 'linux':
        return system;
      default:
        return 'unknown_os';
    }
  }

  /**
    * Checks whether or not a library is valid for download on a particular OS, following
    * the rule format specified in the mojang version data index. If the allow property has
    * an OS specified, then the library can ONLY be downloaded on that OS. If the disallow
    * property has instead specified an OS, the library can be downloaded on any OS EXCLUDING
    * the one specified.
    *
    * If the rules are undefined, the natives property will be checked for a matching entry
    * for the current OS.
    *
    * @param {Array<Rule>} rules The Library's download rules.
    * @param {Object} natives The Library's natives object.
    * @returns {Promise<boolean>} True if the Library follows the specified rules, otherwise false.
    */
  static validateRules(rules, natives) {
    return new Promise((resolve) => {
      if (!rules) {
        return resolve(natives[Library.mojangFriendlyOs()] !== null);
      }

      rules.forEach((rule) => {
        const { action, os } = rule;

        if (action && os) {
          const osName = os.name;
          const osMojang = Library.mojangFriendlyOs();

          switch (action) {
            case 'allow':
              resolve(osName === osMojang);
              break;
            case 'disallow':
              resolve(osName !== osMojang);
              break;
            default:
              resolve(false);
          }
        } else {
          resolve(true);
        }
      });

      return resolve(true);
    });
  }
}
