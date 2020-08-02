/**
 * Represents a base asset
 *
 * @export
 * @class Asset
 */
export default class Asset {
  id;

  size;

  from;

  to;

  constructor(id, size, from, to) {
    if (!id || !size || !from || !to) {
      throw new Error('Missing required arguments needed to construct Asset');
    }

    this.id = id;
    this.size = size;
    this.from = from;
    this.to = to;
  }
}
