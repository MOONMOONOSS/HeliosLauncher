<template>
  <dialog
    id="container"
    :hide="!isServerSelectOpen"
  >
    <header>Available Servers</header>
    <div id="item-container">
      <ServerItem
        v-for="server in servers"
        :key="server.id"
        :data="server"
        :selected="isSelected(server.id)"
        @select-server="updatePendingServer"
      />
    </div>
    <div id="selection">
      <button @click="saveNewServer">
        Select
      </button>
      <button
        @click="closePanel"
      >
        Cancel
      </button>
    </div>
  </dialog>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line
import { mapGetters, mapMutations } from 'vuex';

import ServerItem from './serverSelector/ServerItem';

export default {
  name: 'ServerSelector',
  components: {
    ServerItem,
  },
  data: () => ({
    newServer: null,
  }),
  computed: {
    ...mapGetters('Landing', ['isServerSelectOpen']),
    ...mapGetters('Distribution', [
      'servers',
      'selectedServerId',
    ]),
  },
  methods: {
    ...mapMutations('Landing', ['serverVisibility']),
    ...mapMutations('Distribution', ['selectedServer']),
    updatePendingServer(ev) {
      this.newServer = ev;
    },
    isSelected(id) {
      if (!this.newServer) {
        return this.selectedServerId === id;
      }

      return this.newServer === id;
    },
    closePanel() {
      this.serverVisibility(false);
      this.newServer = null;
    },
    saveNewServer() {
      if (this.newServer) this.selectedServer(this.newServer);
      this.closePanel();
    },
  },
};
</script>

<style scoped lang="stylus">
dialog
  border none
  color white

header
  font-size 24px
  font-weight 900
  margin-bottom 3rem

#container
  align-items center
  background rgba(0,0,0,.85)
  display flex
  flex-direction column
  left 0
  height 100%
  justify-content center
  padding 0 8rem
  position absolute
  transition .85s ease
  width calc(100vw - 16rem)
  z-index 2
  &[hide]
    opacity 0
    pointer-events none

#item-container
  max-height calc(100vh - 200px)
  overflow-y auto

#selection
  margin-top 3rem
  button
    background none
    border 1px solid white
    border-radius 9px
    transition .35s ease
    &:hover, &:focus
      cursor pointer
      text-shadow 0 0 20px white
      outline none
</style>
