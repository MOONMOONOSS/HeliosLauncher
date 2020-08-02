import ProcessBuilder from './processBuilder';

export default class ProcessExec {
  constructor() {
    process.on('message', (msg) => {
      const { data } = msg;

      switch (msg.context) {
        case 'start-game':
          new ProcessBuilder(
            data.distroServer,
            data.versionData,
            data.forgeData,
            data.authUser,
            null,
            data.modConfig,
            data.javaConfig,
            data.minecraftConfig,
            data.commonDir,
          ).build();

          break;
        case 'disconnect':
          process.exit(0);
          break;
        default:
          console.warn(`Unknown context in ProcessBuilder: ${msg.context}`);
          console.dir(msg);
      }
    });

    process.on('disconnect', () => {
      console.log('ProcessBuilder Disconnected');
      process.exit(0);
    });
  }
}
