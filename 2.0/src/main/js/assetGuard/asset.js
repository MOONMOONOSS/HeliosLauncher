// @flow

/**
 * Represents a base asset
 *
 * @export
 * @class Asset
 */
export default class Asset {
  id: string;

  hash: string;

  size: number;

  from: string;

  to: string;

  constructor(id: string, hash: string, size: number, from: string, to: string) {
    if (!id || !hash || !size || !from || !to) {
      throw new Error('Missing required arguments needed to construct Asset');
    }

    this.id = id;
    this.hash = hash;
    this.size = size;
    this.from = from;
    this.to = to;
  }
}
