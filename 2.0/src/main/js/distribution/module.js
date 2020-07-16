import Types from './types';

/**
 * Represents a Module containing Artifacts to download
 *
 * @requires Required
 * @requires Artifact
 * @requires Types
 * @export
 * @class Module
 */
export default class Module {
  /**
   * Resolve the default extension for a specific module type.
   *
   * @static
   * @private
   * @requires Types
   * @param {string} type
   * @returns {string} The default extension for a given type.
   * Will be null if a type does not have a default extension.
   * @memberof Module
   */
  static resolveExtension(type) {
    switch (type) {
      case Types.Library:
      case Types.ForgeHosted:
      case Types.FabricHosted:
      case Types.FabricMod:
      case Types.ForgeMod:
        return 'jar';
      case Types.File:
      default:
        return null;
    }
  }

  /**
   * Creates an instance of Module.
   * @param {Object} json A Json object representing a Module.
   * @param {string} serverId The ID of the server to which this module belongs.
   * @memberof Module
   */
  constructor(serverId, json) {
    if (json) {
      this.id = json.id;
      this.type = json.type;
    }
  }

  /**
   * TODO: Figure what the hell this does
   *
   * @private
   * @memberof Module
   */
  resolveMetadata() {
    try {
      console.log(this.id);
      const m0 = this.id.split('@');

      this.extension = m0[1] || Module.resolveExtension(this.type);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Improper ID for module', this.id, err);
    }
  }
}
