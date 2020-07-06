<template>
  <section id="social">
    <div class="mediaContainer" id="settings">
      <button>
        <img src="static/svg/settings.svg" type="image/svg+xml"/>
        <div class="tooltip">Settings</div>
      </button>
    </div>

    <div id="divider" class="flex">
      <div class="divider"></div>
    </div>

    <div v-for="obj in externalMedia" :key="obj.link" class="mediaContainer">
      <a @click="openLink(obj.link)">
        <img :src="`static/svg/${obj.svg}.svg`" type="image/svg+xml"/>
      </a>
    </div>
  </section>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line

export default {
  name: 'social',
  data: () => ({
    externalMedia: [
      {
        link: 'https://github.com/MOONMOONOSS/HeliosLauncher',
        svg: 'link',
      },
      {
        link: 'https://twitter.com/moonmoon_ow',
        svg: 'twitter',
      },
      {
        link: 'https://streamlabs.com/dunklheit/tip',
        svg: 'donate',
      },
    ],
  }),
  methods: {
    openLink(url) {
      shell.openExternal(url);
    },
  },
};
</script>

<style scoped lang="stylus">
a, button
  &:hover, &:focus
    cursor pointer
    outline none

section
  display flex
  flex-direction row
  padding 0 10%
  justify-content space-between

.divider
  background white
  display flex
  height 1px
  margin 10px 0
  width 15px

.flex
  align-items center
  display flex
  justify-content center

.mediaContainer
  align-items center
  display flex
  height 15px
  margin 5px 0
  justify-content center
  width 15px
  *
    height 15px
    transition .25s ease
    width 15px
  &:hover, &:focus
    *:not(.tooltip)
      height 25px
      width 25px
    .tooltip
      opacity 1
      right 180%
      visibility visible
  // For first icon in the media link section
  // To remove excessive margin on divider
  &:nth-child(2)
    margin-top 0
  // Removes excessive margin on last icon
  &:last-child
    margin-bottom 0
  button
    background none
    border none
    padding 0

.tooltip
  background-color rgba(0,0,0,.75)
  border-radius 4px
  opacity 0
  height 20px
  line-height 20px
  position absolute
  right 150%
  top -20%
  transition .25s ease
  transition-property opacity, right
  visibility hidden
  width 75px
  &::after
    border-color transparent transparent transparent rgba(0,0,0,.75)
    border-style solid
    border-width 5px
    content ' '
    left 100%
    margin-top -5px
    position absolute
    top 50%

#divider
  height 15px
  width 15px

#settings
  position relative

#social
  align-items flex-end
  display flex
  flex-direction column
  margin-top 25px
</style>
