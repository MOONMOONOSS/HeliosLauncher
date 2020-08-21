<template>
  <main>
    <BasicEntry
      v-for="entry in basicEntries"
      :key="entry.id"
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
    });
  },
  beforeUnmount() {
    ipcRenderer.removeAllListeners('basic-chat');
  },
};
</script>

<style scoped lang="stylus">
main
  align-self flex-end
  background unset
  background-color rgba(0,0,0,.09)
  flex-grow 1
  letter-spacing 1.25px
</style>

<style lang="stylus">
#badge
  background rgba(255,129,0,.1)
</style>
