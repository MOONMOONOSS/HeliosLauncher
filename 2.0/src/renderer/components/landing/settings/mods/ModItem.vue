<template>
  <div class="modItem">
    <div class="modTitle">
      {{ module.name }}
    </div>
    <div class="modVersion">
      {{ module.artifactVersion }}
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'; // eslint-disable-line

export default {
  name: 'ModItem',
  props: {
    module: Object,
  },
};
</script>

<style scoped lang="stylus">
.modItem
  border-radius 5px
  padding 5px 15px
  transition .85s ease
  &[required]
    &:hover
      cursor pointer
  &:hover
    background rgba(255,255,255,.2)

.modTitle
  font-size 16px
  font-weight 900

.modVersion
  color gray
  font-size 12px
</style>
