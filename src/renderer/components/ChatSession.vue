<template>
  <main>
    <GenericEntry
      v-for="entry in chatEntries"
      :key="entry.id"
      :obj="entry"
      :parser="parser"
    />
  </main>
</template>

<script>
/* eslint-disable import/no-extraneous-dependencies */
import { ipcRenderer } from 'electron';
import { EmoteFetcher, EmoteParser } from '@mkody/twitch-emoticons';

import GenericEntry from '@/components/chat/GenericEntry';
import Obfuscator from '@/js/obfuscator';

export default {
  name: 'ChatSession',
  components: {
    GenericEntry,
  },
  data: () => ({
    channels: [
      'moonmoon',
      'moonmoon_ow',
    ],
    chatEntries: [],
    fetcher: new EmoteFetcher(),
    parser: null,
  }),
  mounted() {
    this.$nextTick(() => {
      ipcRenderer.on('msg-received', (_ev, payload) => {
        console.log('Adding below entry to chat overlay...');
        console.dir(payload);
        this.chatEntries.push(payload);
      });

      this.parser = new EmoteParser(this.fetcher, {
        type: 'html',
        match: /:(.+?):/g,
      });

      this.loadEmotes();

      Obfuscator.construct();
    });
  },
  methods: {
    async loadEmotes() {
      await this.fetcher.fetchTwitchEmotes();
      await this.fetcher.fetchBTTVEmotes();

      if (this.channels && this.channels.length > 0) {
        this.channels.forEach((channel) => {
          this.fetcher.fetchTwitchEmotes(channel);
          this.fetcher.fetchBTTVEmotes(channel);
          this.fetcher.fetchFFZEmotes(channel);
        });
      }
    },
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
