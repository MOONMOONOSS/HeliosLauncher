<template>
  <div id="app">
    <FrameBar/>
    <router-view></router-view>
  </div>
</template>

<script>
import FrameBar from './components/electron/FrameBar.vue';

export default {
  name: 'launcher',
  components: { FrameBar },
  mounted() {
    this.$nextTick(async () => {
      const loader = document.getElementById('loadingContainer');
      loader.style.opacity = 0;

      await new Promise((resolve) => {
        setTimeout(() => {
          loader.style.visibility = 'hidden';
          resolve();
        }, 500);
      });

      this.$el.style.opacity = 1;
    });
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
  /* display none */
  height -webkit-fill-available
  opacity 0
  transition all .85s ease
  transition-delay .5s
  width 100%
  z-index 0

#app[overlay]
  filter blur(3px) contrast(.9) brightness(1.0)
</style>
