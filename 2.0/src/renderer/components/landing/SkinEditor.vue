<template>
  <dialog id="editor" :hide="!isSkinEditOpen">
    <div id="container">
      <header>
        <button @click="skinVisibility(false)">
          <svg name="titleBarClose" width="10" height="10" viewBox="0 0 12 12">
            <polygon stroke="#ffffff" fill="#ffffff" fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"></polygon>
          </svg>
        </button>
      </header>
      <main>
        <div>Hello World!</div>
      </main>
    </div>
  </dialog>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: 'skin-editor',
  computed: {
    ...mapGetters('Landing', ['isSkinEditOpen']),
  },
  methods: {
    ...mapMutations('Landing', ['skinVisibility']),
  },
};
</script>

<style scoped lang="stylus">
button
  background none
  border none
  border-top-right-radius 8px
  height 22px
  position relative
  right -5px
  top -6px
  transition .85s ease
  width 39px
  &:focus, &:hover
    background rgba(255,53,53,.61)
    color #c1c1c1
    cursor pointer
    outline none

dialog
  border none
  color white

header
  align-self flex-end

main
  align-items center
  // Remove styling from App.vue
  background none
  display flex
  flex-grow 1

#editor
  align-items center
  background rgba(0,0,0,.85)
  display flex
  left 0
  height 100%
  justify-content center
  padding 0 8rem
  position absolute
  transition .85s ease
  width calc(100vw - 16rem)
  z-index 2
  &[hide]
    opacity 0
    pointer-events none
    transform scale(1.5)

#container
  align-items center
  background-color #36393f
  border 5px solid #36393f
  border-radius 8px
  display flex
  flex-direction column
  height 50vh
  width 70vw
</style>
