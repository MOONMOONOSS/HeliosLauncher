<template>
  <section>
    <div id="status" class="grow">
      <div id="server">
        PLAYERS <span>{{numPlayers}}/{{maxPlayers}}</span>
      </div>
      <div class="horiDivider"></div>
      <div id="mojang">
        MOJANG STATUS<span>•</span>
        <div class="tooltip" id="services">
          
        </div>
      </div>
    </div>
    <div id="news" class="grow">
      <button><span>^</span>NEWS</button>
    </div>
    <div id="launchControls" class="grow">
      <button id="play">PLAY</button>
      <div class="horiDivider"></div>
      <button>• Nether Update</button>
    </div>
  </section>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line

export default {
  name: 'launch',
  data: () => ({
    numPlayers: 12,
    maxPlayers: 50,
  }),
};
</script>

<style scoped lang="stylus">
button
  &:hover, &:focus
    cursor pointer
    outline none

section
  align-items center
  display flex
  flex-direction row
  margin-bottom 5rem
  padding 0 10%
  justify-content space-between

.grow
  flex-grow 1

.horiDivider
  background rgba(107,105,105,.7)
  height 25px
  margin 0 20px
  width 2px

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

#launchControls
  display flex
  justify-content flex-end
  button
    background none
    border none
    font-size 20px
    font-weight 900
    letter-spacing 2px
    padding 0

#mojang
  font-size 12px
  font-weight 900
  letter-spacing 1px
  line-height 24px
  position relative
  span
    margin-left 10px

#news
  display flex
  justify-content center
  button
    background none
    border none
    font-weight 900
    letter-spacing 2px
    position relative
    transition .25s ease
    &:hover, &:focus
      cursor pointer
      outline none
      text-shadow 0 0 20px white
    span
      font-size 24px
      left calc(50% - 8px)
      position absolute
      top -100%

#server
  display flex
  font-size 12px
  font-weight 900
  letter-spacing 1px
  line-height 24px
  span
    color #949494
    font-size 10px
    margin-left 10px

#status
  display flex
</style>
