/**
 * Contains two fields which determine
 * the loading requirements and loading
 * defaults for a Module.
 *
 * @export
 * @see {Module}
 * @class Required
 */
export default class Required {
  /**
   * Creates an instance of Required.
   *
   * @param {Object} json A JSON representation of a Required object.
   * @memberof Required
   */
  constructor(json) {
    // Attempt parsing by JSON
    if (json) {
      this.required = json.value;
      this.default = json.def;
    } else {
    // Default to required
      this.required = true;
      this.default = true;
    }
  }

  /**
   * Get the default value for a required object. If a module
   * is not required, this value determines whether or not
   * it is enabled by default.
   *
   * @readonly
   * @returns {boolean} The default load status for an object.
   * @memberof Required
   */
  get default() {
    return this.default;
  }

  /**
   * The requirement status of a module
   *
   * @readonly
   * @returns {boolean} Whether or not the module is required.
   * @memberof Required
   */
  get required() {
    return this.required;
  }
}
