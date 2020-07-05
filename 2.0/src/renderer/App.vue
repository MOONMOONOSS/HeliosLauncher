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
  margin 0
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
  position absolute
  width 100%
  z-index 10

#app[overlay]
  filter blur(3px) contrast(.9) brightness(1.0)
</style>
