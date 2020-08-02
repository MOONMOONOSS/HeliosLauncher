<template>
  <dialog
    id="container"
    :hide="!isSettingsOpen"
  >
    <aside>
      <header>Settings</header>
      <div class="spacer" />
      <button
        :selected="currentTab === 'AccountTab'"
        @click="currentTab = 'AccountTab'"
      >
        Account
      </button>
      <button
        :selected="currentTab === 'MinecraftTab'"
        @click="currentTab = 'MinecraftTab'"
      >
        Minecraft
      </button>
      <button
        :selected="currentTab === 'ModTab'"
        @click="currentTab = 'ModTab'"
      >
        Mods
      </button>
      <button
        :selected="currentTab === 'JavaTab'"
        @click="currentTab = 'JavaTab'"
      >
        Java
      </button>
      <div class="spacer" />
      <button>About</button>
      <div class="divider" />
      <button @click="settingsVisibility(false)">
        Done
      </button>
    </aside>
    <keep-alive>
      <component
        :is="currentTab"
        class="tab"
      />
    </keep-alive>
  </dialog>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line
import { mapGetters, mapMutations } from 'vuex';

import AccountTab from './settings/Account';
import MinecraftTab from './settings/Minecraft';
import ModTab from './settings/Mods';
import JavaTab from './settings/Java';

export default {
  name: 'Settings',
  components: {
    AccountTab,
    MinecraftTab,
    ModTab,
    JavaTab,
  },
  data: () => ({
    currentTab: 'AccountTab',
  }),
  computed: {
    ...mapGetters('Landing', ['isSettingsOpen']),
  },
  methods: {
    ...mapMutations('Landing', ['settingsVisibility']),
  },
};
</script>

<style scoped lang="stylus">
aside
  align-items end
  display flex
  flex-direction column
  margin-right 5rem

button
  background none
  border none
  color gray
  margin 5px 0
  padding 0
  transition .85s ease
  &[selected]
    color white
  &:focus, &:hover
    color #c1c1c1
    cursor pointer
    outline none

dialog
  border none
  color white

header
  font-size 30px

.divider
  border 1px solid gray
  width 75%

.spacer
  margin 5px 0

.tab
  flex-grow 1
  justify-content center

#container
  align-items center
  background rgba(0,0,0,.85)
  display flex
  left 0
  height 100vh
  justify-content center
  padding 0 8rem
  position absolute
  transition .85s ease
  width calc(100vw - 16rem)
  z-index 2
  &[hide]
    opacity 0
    pointer-events none
</style>
