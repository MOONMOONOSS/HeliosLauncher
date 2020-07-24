<template>
  <div
    id="app"
    :overlay="isServerSelectOpen || isSettingsOpen || isSkinEditOpen"
  >
    <FrameBar />
    <router-view />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import FrameBar from './components/electron/FrameBar.vue';

const storage = window.localStorage;

export default {
  name: 'Launcher',
  components: { FrameBar },
  computed: {
    ...mapGetters('Route', ['firstLaunch']),
    ...mapGetters('Landing', [
      'isSettingsOpen',
      'isSkinEditOpen',
      'isServerSelectOpen',
    ]),
  },
  mounted() {
    // Set first launch property if not present
    // Suppresses the welcome screen
    try {
      storage.setItem('first-launch', 'false');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Unable to access site storage!');
    }

    // Redirect to login screen if not first launch
    if (
      this.$router.currentRoute.name === 'welcome-page'
      && !this.firstLaunch
    ) {
      this.$router.push({ name: 'minecraft-login' });
    }

    this.$nextTick(async () => {
      this.pullDistro();

      const loader = document.getElementById('loadingContainer');

      // eslint-disable-next-line no-new
      new Promise((resolve) => {
        setTimeout(() => {
          loader.style.opacity = 0;
          resolve();
        }, 500);
      });

      await new Promise((resolve) => {
        setTimeout(() => {
          loader.style.visibility = 'hidden';
          resolve();
        }, 1000);
      });

      this.$el.style.opacity = 1;
    });
  },
  methods: {
    ...mapActions('Distribution', ['pullDistro']),
  },
};
</script>

<style lang="stylus">
@font-face
  font-family 'Avenir Book'
  src url(../../static/fonts/Avenir-Book.ttf)

@font-face
  font-family 'Avenir Medium'
  src url(../../static/fonts/Avenir-Medium.ttf)

::-webkit-scrollbar
  width 2px

::-webkit-scrollbar-track
  display none

::-webkit-scrollbar-thumb
  border-radius 10px
  box-shadow inset 0 0 10px rgba(255,255,255,.5)

body
  height 100vh
  margin 0
  overflow hidden
  transition background-image 1s ease
  user-select none

body, button
  color white
  font-family 'Avenir Book'

main
  background linear-gradient(to top, rgba(0, 0, 0, .75) 0%, rgba(0, 0, 0, 0) 100%)

#app
  background-image url('../../static/img/bgs/0.jpg')
  background-size cover
  height -webkit-fill-available
  opacity 0
  transition all .85s ease
  transition-delay opacity .5s
  width 100%
  z-index 0
  &[overlay] section
    filter blur(3px) contrast(.9) brightness(1.0)
</style>
