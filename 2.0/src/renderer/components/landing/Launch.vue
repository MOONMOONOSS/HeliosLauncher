<template>
  <section :hide="launching">
    <div
      id="status"
      class="grow"
    >
      <div id="server">
        PLAYERS <span>{{ numPlayers }}/{{ maxPlayers }}</span>
      </div>
      <div class="horiDivider" />
      <div id="mojang">
        MOJANG STATUS<span>•</span>
        <div
          id="services"
          class="tooltip"
        />
      </div>
    </div>
    <div
      id="launchControls"
      class="grow"
    >
      <LaunchStatus
        :show="launching"
        :status="statusText"
      />
      <button
        id="play"
        :disabled="launching"
        @click="playGame()"
      >
        PLAY
      </button>
      <div class="horiDivider" />
      <button
        id="server-select"
        :disabled="launching"
        @click="serverVisibility(true)"
      >
        • {{ selectedServerName }}
      </button>
    </div>
  </section>
</template>

<script>
/* eslint-disable import/no-extraneous-dependencies */
import { ipcRenderer, remote } from 'electron';
import { mapGetters, mapMutations } from 'vuex';

import LaunchStatus from './launch/LaunchStatus';

export default {
  name: 'Launch',
  components: {
    LaunchStatus,
  },
  data: () => ({
    launching: false,
    numPlayers: 0,
    maxPlayers: 0,
    serverIntervalId: null,
    statusText: 'Starting AssetGuard',
  }),
  computed: {
    ...mapGetters('Account', [
      'authUser',
    ]),
    ...mapGetters('Landing', [
      'serverStatus',
    ]),
    ...mapGetters('Java', [
      'javaConfig',
      'selectedJavaExe',
    ]),
    ...mapGetters('Distribution', [
      'selectedEnabledModules',
      'selectedServer',
      'selectedServerId',
      'selectedServerName',
      'selectedServerAddress',
      'selectedServerPort',
    ]),
    ...mapGetters('Minecraft', [
      'minecraftConfig',
    ]),
  },
  watch: {
    selectedServer() {
      this.updatePlayerCount();
    },
  },
  mounted() {
    this.$nextTick(() => {
      const VALIDATE = 'Validating';
      const DOWNLOAD = 'Downloading';
      const START = 'Starting';

      this.updatePlayerCount();
      this.serverIntervalId = window.setInterval(this.updatePlayerCount, 30000);

      ipcRenderer.on('java-status', (_ev, data) => {
        if (data && data.data !== false) {
          this.setJavaExe(data.data);
          this.validate();
        } else {
          this.launching = false;
        }
      });

      ipcRenderer.on('launch-status', (_ev, data) => {
        this.statusText = data;
      });

      ipcRenderer.on('validate-status', (_ev, data) => {
        if (data.context === 'validate') {
          switch (data.data) {
            case 'distribution':
              this.statusText = `${START} Distribution Validation`;
              break;
            case 'version':
              this.statusText = `${START} Version Manifest Validation`;
              break;
            case 'assets':
              this.statusText = `${START} Asset Validation`;
              break;
            case 'libraries':
              this.statusText = `${START} Library Validation`;
              break;
            case 'files':
              this.statusText = `${START} Misc Files Validation`;
              break;
            default:
          }
        }
      });

      ipcRenderer.on('launch-progress', (_ev, data) => {
        switch (data.data) {
          case 'assets':
            this.statusText = `${VALIDATE} Pack Assets (${data.percent}%)`;
            break;
          case 'download':
            if (data.percent === 100) {
              this.statusText = 'Thinking (very) hard';
            } else {
              this.statusText = `${DOWNLOAD} Pack Content (${data.percent}%)`;
            }
            break;
          case 'extract':
            this.statusText = `Extracting Libraries (${data.percent}%)`;
            break;
          default:
        }
      });

      ipcRenderer.on('validate-finished', (_ev, data) => {
        this.statusText = 'See you in-game';

        this.startGame(data.forgeData, data.versionData);
      });

      ipcRenderer.on('game-close', () => {
        this.statusText = 'Starting AssetGuard';
        this.launching = false;
      });
    });
  },
  methods: {
    ...mapMutations('Landing', [
      'serverVisibility',
    ]),
    ...mapMutations('Java', [
      'setJavaExe',
    ]),
    async updatePlayerCount() {
      const status = await this.serverStatus({
        address: this.selectedServerAddress,
        port: this.selectedServerPort,
      });
      this.numPlayers = status.onlinePlayers;
      this.maxPlayers = status.maxPlayers;
    },
    playGame() {
      this.launching = true;
      ipcRenderer.send('java-scan');
    },
    startGame(forgeData, versionData) {
      ipcRenderer.send('start-game', {
        authUser: this.authUser,
        commonDir: remote.app.getPath('userData'),
        distroServer: this.selectedServer,
        forgeData,
        javaConfig: this.javaConfig,
        minecraftConfig: this.minecraftConfig,
        modConfig: this.selectedEnabledModules,
        versionData,
      });
    },
    validate() {
      ipcRenderer.send('start-download', {
        server: this.selectedServerId,
        javaExe: this.selectedJavaExe,
      });
    },
  },
};
</script>

<style scoped lang="stylus">
button
  transition .35s ease
  &:hover, &:focus
    cursor pointer
    text-shadow 0 0 20px white
    outline none

section
  align-items center
  display flex
  flex-direction row
  margin-bottom 5rem
  overflow hidden
  padding 0 10%
  justify-content space-between
  &[hide]
    #launchControls
      transform translateY(-28px)

.grow
  flex-grow 1

.horiDivider
  background rgba(107,105,105,.7)
  height 25px
  margin 0 20px
  width 2px

.tooltip
  background-color rgba(0,0,0,.75)
  border-radius 4px
  opacity 0
  height 20px
  line-height 20px
  position absolute
  right 150%
  top -20%
  transition .25s ease
  transition-property opacity, right
  visibility hidden
  width 75px
  &::after
    border-color transparent transparent transparent rgba(0,0,0,.75)
    border-style solid
    border-width 5px
    content ' '
    left 100%
    margin-top -5px
    position absolute
    top 50%

#launchControls
  display flex
  justify-content flex-end
  transition .2s ease
  button
    background none
    border none
    font-size 20px
    font-weight 900
    letter-spacing 2px
    padding 0

#mojang
  font-size 12px
  font-weight 900
  letter-spacing 1px
  line-height 24px
  position relative
  span
    margin-left 10px

#server
  display flex
  font-size 12px
  font-weight 900
  letter-spacing 1px
  line-height 24px
  span
    color #949494
    font-size 10px
    margin-left 10px

#server-select
  max-width 250px
  overflow hidden
  text-overflow ellipsis
  white-space nowrap

#status
  display flex
</style>
