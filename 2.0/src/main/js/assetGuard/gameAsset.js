// @flow

import Asset from './asset';

/**
 * Represents a base asset
 *
 * @export
 * @class Asset
 */
export default class GameAsset extends Asset {
  hash;

  constructor(id, hash, size, from, to) {
    if (!id || !hash || !size || !from || !to) {
      throw new Error('Missing required arguments needed to construct Asset');
    }

    super(id, size, from, to);

    this.hash = hash;
  }
}
