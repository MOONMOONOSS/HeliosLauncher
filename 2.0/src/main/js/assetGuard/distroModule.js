// @flow

import GameAsset from './gameAsset';

/**
 * Represents a Distribution Module asset.
 *
 * @export
 * @class DistroModule
 * @extends {GameAsset}
 */
export default class DistroModule extends GameAsset {
  type;

  /**
   * Create a DistroModule. This is for processing,
   * not equivalent to the module objects in the
   * distro index.
   *
   * @param {string} id
   * @param {string} hash
   * @param {number} size
   * @param {string} from
   * @param {string} to
   * @param {string} type
   * @memberof DistroModule
   */
  constructor(
    id,
    hash,
    size,
    from,
    to,
    type,
  ) {
    if (!type) {
      throw new Error('Missing required fields needed to instantiate DistroModule');
    }

    super(id, hash, size, from, to);
    this.type = type;
  }
}
