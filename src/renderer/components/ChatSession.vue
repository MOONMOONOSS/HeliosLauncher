<template>
  <main>
    <component
      v-for="entry in chatEntries"
      :key="entry.id"
      :is="getComponentType(entry.type)"
      :obj="entry"
    />
  </main>
</template>

<script>
/* eslint-disable import/no-extraneous-dependencies */
import { ipcRenderer } from 'electron';

import BasicColored from './chat/BasicColored';
import BasicEntry from './chat/BasicEntry';
import BasicPlayer from './chat/BasicPlayer';

export default {
  name: 'ChatSession',
  components: {
    BasicColored,
    BasicEntry,
    BasicPlayer,
  },
  data: () => ({
    chatEntries: [],
  }),
  mounted() {
    this.$nextTick(() => {
      ipcRenderer.on('msg-received', (_ev, payload) => {
        console.log('Adding below entry to chat overlay...');
        console.dir(payload);
        this.chatEntries.push(payload);
      });
    });
  },
  methods: {
    getComponentType(recvdType) {
      switch (recvdType) {
        case 'basic-colored':
          return 'BasicColored';
        case 'basic-player':
          return 'BasicPlayer';
        default:
          return 'BasicEntry';
      }
    },
  },
  beforeUnmount() {
    ipcRenderer.removeAllListeners('msg-received');
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
