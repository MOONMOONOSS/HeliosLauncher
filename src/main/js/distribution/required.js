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
}
