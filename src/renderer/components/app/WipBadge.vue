<template>
  <div id="badge">
    Alpha 1
  </div>
</template>

<script>
export default {
  name: 'WipBadge',
};
</script>

<style lang="stylus">
#badge
  background rgba(255,129,0,.75)
  font-size 20px
  padding 0 4rem
  position absolute
  right -3rem
  top 2rem
  transform rotate(45deg)
  z-index 99
</style>
