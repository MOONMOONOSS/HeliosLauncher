<template>
  <div
    class="buttonContainer"
    @click="$emit('toggle')"
  >
    <label
      class="modButton"
      :checked="checked"
    >
      <span
        class="slider"
        :checked="checked"
      />
    </label>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'; // eslint-disable-line

export default {
  name: 'SliderButton',
  props: {
    checked: Boolean,
  },
  emits: ['toggle'],
};
</script>

<style scoped lang="stylus">
.buttonContainer
  display inline-flex

.modButton
  align-self center
  background-color rgba(255,255,255,.35)
  border 1px solid rgba(126,126,126,.57)
  border-radius 50px
  height 20px
  width 40px
  &[checked]
    background-color rgb(31,140,11)
    border 1px solid rgb(31,140,11)
  &:hover
    cursor pointer

.slider
  &[checked]
    &::before
      transform translateX(20px)
  &::before
    background-color white
    border-radius 50px
    box-shadow 0 1px 2px 0 rgba(0,0,0,.75)
    content ""
    display inline-flex
    height 13px
    transform translateX(5px)
    transition .4s ease
    width 16px
</style>
