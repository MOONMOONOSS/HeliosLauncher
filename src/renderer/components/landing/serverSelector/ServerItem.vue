<template>
  <button
    @click="$emit('select-server', data.id)"
  >
    <img
      :src="data.icon"
    >
    <aside>
      <div id="title">
        {{ data.name }}
      </div>
      <div id="desc">
        {{ data.description }}
      </div>
      <div id="metadata">
        <div id="mc-version">
          {{ data.minecraftVersion }}
        </div>
        <div id="pack-version">
          {{ data.version }}
        </div>
      </div>
    </aside>
  </button>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line

import { mapGetters } from 'vuex';

export default {
  name: 'ServerItem',
  props: {
    // eslint-disable-next-line vue/require-default-prop
    data: {
      type: Object,
    },
  },
  emits: ['select-server'],
  computed: {
    ...mapGetters('Distribution', ['selectedServerId']),
  },
};
</script>

<style scoped lang="stylus">
aside
  align-items flex-start
  display flex
  flex-direction column

button
  align-items center
  background rgba(131,131,131,.25)
  border none
  color white
  display flex
  margin 5px 0
  min-height 60px
  opacity .6
  padding 0
  transition .25s ease
  width 375px
  &:focus, &:hover, &[selected]
    cursor pointer
    opacity 1
    outline none

img
  border 1px solid white
  height 50px
  margin 0 10px 0 5px

#desc
  font-size 12px
  font-weight 900

#metadata
  display flex
  font-size 12px

#mc-version
  align-self center
  background rgba(31,140,11,.8)
  border-radius 2px
  padding 0 4px

#pack-version
  color gray
  padding 0 5px

#title
  font-size 16px
  font-weight 900
</style>
