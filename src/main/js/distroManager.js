import fs from 'fs';
import fetchNode from 'node-fetch';
import path from 'path';

import DistroIndex from './distribution/distroIndex';

export default class DistroManager {
  static distributionUrl = 'https://raw.githubusercontent.com/MOONMOONOSS/HeliosLauncher/vue/2.0/static/distribution.json';

  static pullRemote(commonPath) {
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

          fs.writeFile(path.join(commonPath, 'distribution.json'), JSON.stringify(data), 'utf-8', (err) => {
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
