import fs from 'fs';
import fetchNode from 'node-fetch';
import path from 'path';
import { app } from 'electron';

import DistroIndex from './distribution/distroIndex';

export default class DistroManager {
  // static distributionUrl: string = 'https://raw.githubusercontent.com/MOONMOONOSS/HeliosLauncher/vue/2.0/static/other/distribution.json';

  static distributionUrl = 'https://raw.githubusercontent.com/MOONMOONOSS/HeliosLauncher/master/app/assets/distribution.json';

  static launcherDir = app.getPath('userData');

  static distributionDest = path.join(DistroManager.launcherDir, 'distribution.json');

  static pullRemote() {
    return new Promise((resolve, reject) => {
      const opts = {
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
