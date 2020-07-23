// @flow

/**
 * Represents a base asset
 *
 * @export
 * @class Asset
 */
export default class Asset {
  id: string;

  size: number;

  from: string;

  to: string;

  constructor(id: string, size: number, from: string, to: string) {
    if (!id || !size || !from || !to) {
      throw new Error('Missing required arguments needed to construct Asset');
    }

    this.id = id;
    this.size = size;
    this.from = from;
    this.to = to;
  }
}
