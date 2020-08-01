<template>
  <div
    id="play-overlay"
    :show="show"
  >
    <div id="inner">
      {{ status }}...
    </div>
  </div>
</template>

<script>
export default {
  name: 'LaunchStatus',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'Dunkel made an oopsie!',
    },
  },
};
</script>

<style scoped lang="stylus">
#play-overlay
  display inline-flex
  font-size 20px
  font-weight 900
  justify-content flex-end
  opacity 0
  pointer-events none
  position absolute
  transition transform .2s ease
  width 100%
  z-index 3
  &[show]
    opacity 1
    pointer-events all

#inner
  transform translateY(28px)
  transition inherit
</style>
