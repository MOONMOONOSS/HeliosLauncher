<template>
  <section>
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
      <button
        id="play"
        @click="playGame()"
      >
        PLAY
      </button>
      <div class="horiDivider" />
      <button
        id="server-select"
        @click="serverVisibility(true)"
      >
        • {{ selectedServerName }}
      </button>
    </div>
  </section>
</template>

<script>
import {remote, shell, ipcRenderer} from 'electron'; // eslint-disable-line
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: 'Launch',
  data: () => ({
    numPlayers: 0,
    maxPlayers: 0,
    serverIntervalId: null,
  }),
  computed: {
    ...mapGetters('Landing', ['serverStatus']),
    ...mapGetters('Distribution', [
      'selectedServer',
      'selectedServerName',
      'selectedServerAddress',
      'selectedServerPort',
    ]),
  },
  watch: {
    selectedServer() {
      this.updatePlayerCount();
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.updatePlayerCount();
      this.serverIntervalId = window.setInterval(this.updatePlayerCount, 30000);
    });
  },
  methods: {
    ...mapMutations('Landing', ['serverVisibility']),
    async updatePlayerCount() {
      const status = await this.serverStatus({
        address: this.selectedServerAddress,
        port: this.selectedServerPort,
      });
      this.numPlayers = status.onlinePlayers;
      this.maxPlayers = status.maxPlayers;
    },
    playGame() {
      ipcRenderer.send('java-scan');
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
  padding 0 10%
  justify-content space-between

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
