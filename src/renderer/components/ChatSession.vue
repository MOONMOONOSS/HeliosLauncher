<template>
  <main>
    <GenericEntry
      v-for="entry in chatEntries"
      :key="entry.id"
      :obj="entry"
    />
  </main>
</template>

<script>
/* eslint-disable import/no-extraneous-dependencies */
import { ipcRenderer } from 'electron';

import GenericEntry from '@/components/chat/GenericEntry';
import Obfuscator from '@/js/obfuscator';

export default {
  name: 'ChatSession',
  components: {
    GenericEntry,
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

      Obfuscator.construct();
    });
  },
  beforeUnmount() {
    ipcRenderer.removeAllListeners('msg-received');
    Obfuscator.cancelAllUpdates();
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
