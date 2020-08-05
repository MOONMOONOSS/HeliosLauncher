<template>
  <main>
    <header class="underlined">
      Install OpenJRE 8
    </header>
    <summary>
      MOON2 Launcher was unable to detect a compatible version of Java for use.
      In order to launch Minecraft MOON2 Launcher would like to download and use
      OpenJRE 8, a free to use alterative to Oracle JRE 8. This will download
      approximately 40MB of files to your AppData folder.
    </summary>
    <button
      ref="install"
      :disabled="installing"
      @click="startInstall"
    >
      START INSTALLATION
    </button>
  </main>
</template>

<script>
/* eslint-disable import/no-extraneous-dependencies */
import { ipcRenderer } from 'electron';

export default {
  name: 'MissingJava',
  data: () => ({
    installing: false,
  }),
  mounted() {
    this.$nextTick(() => {
      ipcRenderer.on('java-complete', () => {
        ipcRenderer.send('java-detect', { mcVersion: '1.16.1' });
        this.$router.push({ name: 'welcome-page' });
      });
    });
  },
  beforeUnmount() {
    ipcRenderer.removeAllListeners('java-complete');
  },
  methods: {
    startInstall() {
      ipcRenderer.send('java-install');

      this.$refs.install.innerHTML = 'This may take 5 minutes...';
      this.installing = true;
    },
  },
};
</script>

<style scoped lang="stylus">
button
  background none
  border solid 1px white
  border-radius 10px
  font-size 24px
  letter-spacing 2px
  padding 5px
  transition .85s ease
  &[disabled]
    background none !important
    color white !important
    cursor unset !important
  &:hover, &:focus
    background whitesmoke
    color black
    cursor pointer
    outline none

header
  font-size 64px
  margin-bottom 1rem
  text-align center
  width 16ch

main
  align-items center
  display flex
  flex-direction column
  height calc(100vh - 22px)
  justify-content center
  padding-top 22px
  width 100vw

summary
  font-size 20px
  margin-bottom 1rem
  max-width 80vw
  text-align center
  width 65ch

.underlined
  border-bottom white 1px solid
</style>
