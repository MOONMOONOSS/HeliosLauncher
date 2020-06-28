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
</style>
