<template>
  <div id="mod">
    <div id="sticky">
      <header>Mod Settings</header>
      <summary>Enable or disable mods.</summary>
      <div @click.stop="openServerSelect()">
        <ServerItem
          :data="selectedServer"
          selected
        />
      </div>
    </div>
    <div class="list">
      <div class="header">
        Required Mods
      </div>
      <ModItem
        v-for="module in selectedRequiredModules"
        :key="module.id"
        :module="module"
      />
    </div>
    <div class="list">
      <div class="header">
        Optional Mods
      </div>
      <ModItem
        v-for="module in selectedOptionalModules"
        :key="module.id"
        :module="module"
      />
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'; // eslint-disable-line
import { mapGetters, mapMutations } from 'vuex';

import ModItem from '@/components/landing/settings/mods/ModItem';
import ServerItem from '@/components/landing/serverSelector/ServerItem';

export default {
  name: 'TabMods',
  components: {
    ModItem,
    ServerItem,
  },
  computed: {
    ...mapGetters('Distribution', [
      'selectedServer',
      'selectedOptionalModules',
      'selectedRequiredModules',
    ]),
  },
  methods: {
    ...mapMutations('Landing', [
      'serverVisibility',
    ]),
    openServerSelect() {
      this.serverVisibility(true);
    },
  },
};
</script>

<style scoped lang="stylus">
button
  background none
  border none
  color white
  transition .85s ease
  &:hover, &:focus
    cursor pointer
    outline none

header
  font-size 20px
  font-weight 900

.header
  border-bottom 1px solid rgba(255,255,255,.5)
  font-size 16px
  margin-bottom 10px
  padding-bottom 10px

.list
  display flex
  flex-direction column
  margin-bottom 10px

#mod
  box-shadow 0 -5px 5px 0 black
  display block
  height calc(100vh - 8rem)
  overflow-y auto

#sticky
  background linear-gradient(0deg, transparent 0%, black 25%)
  position sticky
  top 0
</style>
