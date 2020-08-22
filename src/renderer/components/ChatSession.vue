<template>
  <main>
    <BasicEntry
      v-for="entry in basicEntries"
      :key="entry.id"
      :msg-id="entry.id"
      :player="entry.player"
      :message="entry.msg"
    />
  </main>
</template>

<script>
/* eslint-disable import/no-extraneous-dependencies */
import { ipcRenderer } from 'electron';

import BasicEntry from './chat/BasicEntry';

export default {
  name: 'ChatSession',
  components: {
    BasicEntry,
  },
  data: () => ({
    basicEntries: [],
  }),
  mounted() {
    this.$nextTick(() => {
      ipcRenderer.on('basic-chat', (_ev, payload) => {
        console.log('Adding below entry to chat overlay...');
        console.dir(payload);
        this.basicEntries.push(payload);
      });

      ipcRenderer.on('unknown-chat', (_ev, payload) => {
        console.dir(payload);
      });
    });
  },
  beforeUnmount() {
    ipcRenderer.removeAllListeners('basic-chat');
    ipcRenderer.removeAllListeners('unknown-chat');
  },
};
</script>

<style scoped lang="stylus">
main
  align-self flex-end
  background unset
  flex-grow 1
  letter-spacing 1.25px
</style>

<style lang="stylus">
#badge
  background rgba(255,129,0,.1)
</style>
