// @flow

import fs from 'fs';
import fetchNode from 'node-fetch';
import path from 'path';
import { remote } from 'electron';

import DistroIndex from './distribution/distroIndex';

export default class DistroManager {
  static distributionUrl: string = 'https://raw.githubusercontent.com/MOONMOONOSS/HeliosLauncher/vue/2.0/static/other/distribution.json';

  static launcherDir: string = remote.app.getPath('userData');

  static distributionDest: string = path.join(DistroManager.launcherDir, 'distribution.json');

  static pullRemote(): Promise<DistroIndex> {
    return new Promise((resolve, reject) => {
      const opts: any = {
        cache: 'no-cache',
        method: 'GET',
        timeout: 3000,
      };

      fetchNode(DistroManager.distributionUrl, opts)
        .then((res) => {
          if (res.status !== 200) {
            reject(Error('Could not retrieve the Distribution file'));
          }

          return res.json();
        })
        .then((data) => {
          const index = new DistroIndex(data);

          fs.writeFile(DistroManager.distributionDest, JSON.stringify(data), 'utf-8', (err) => {
            if (err) {
              reject(err);
            }

            resolve(index);
          });
        })
        .catch((err) => reject(err));
    });
  }
}
