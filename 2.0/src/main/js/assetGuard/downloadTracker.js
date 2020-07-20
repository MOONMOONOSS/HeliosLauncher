// @flow

import Asset from './asset';

/**
 * Representation of a download tracker.
 * This is used to store metadata about a download
 * queue, including the queue itself.
 *
 * @export
 * @class DlTracker
 */
export default class DlTracker {
  dlQueue: Array<Asset>;

  dlSize: number;

  callback: () => Asset;

  constructor(
    dlQueue: Array<Asset>,
    dlSize: number,
    callback?: () => Asset,
  ) {
    this.dlQueue = dlQueue;
    this.dlSize = dlSize;

    if (typeof callback !== 'undefined') {
      this.callback = callback;
    }
  }
}
