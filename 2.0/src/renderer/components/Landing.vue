<template>
  <main>
    <section>
      <div id="seal">
        <img class="avatar border-circle" src="static/img/loading_seal.png"/>
      </div>
      <div class="spacer"></div>
      <div id="user">
        <div id="userText">{{ username }}</div>
        <button class="avatar border-circle" :style="`background-image: url('https://crafatar.com/renders/body/${uuid}?size=70&default=MHF_Steve');`">
          <div>Edit</div>
        </button>
      </div>
    </section>
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
    <div id="launcherSpacer"></div>
    <section id="gameLaunch">
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
  </main>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line

export default {
  name: 'overview',
  data: () => ({
    username: 'Dunkel is Dumb',
    uuid: 'ec91e5313da043c880b1dcfd0fa2dc18',
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
    numPlayers: 12,
    maxPlayers: 50,
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

main
  display flex
  flex-direction column
  height calc(100% - 22px)
  margin-top 22px
  overflow-y hidden
  padding 0 10px
  transition background 2s ease

section
  display flex
  flex-direction row
  padding 0 10%
  justify-content space-between
  &:first-child
    padding-top 2rem

.avatar
  background-size contain
  background-position center
  background-repeat no-repeat
  height 70px
  width 70px

.border-circle
  border 2px solid #878787
  border-radius 50%

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

.grow
  flex-grow 1

.horiDivider
  background rgba(107,105,105,.7)
  height 25px
  margin 0 20px
  width 2px

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
  // For settings icon
  // To remove excessive margin on divider
  &:first-child
    margin-bottom 0
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

#gameLaunch
  align-items center
  margin-bottom 5rem

#launcherSpacer
  display flex
  flex-grow 1

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

#settings
  position relative

#social
  align-items flex-end
  display flex
  flex-direction column
  margin-top 25px

#status
  display flex

#user
  align-items center
  display flex
  button
    background-color transparent
    padding 0
    div
      align-items center
      background-color rgba(0,0,0,.7)
      border-radius 50%
      display flex
      height 100%
      opacity 0
      justify-content center
      transition .35s ease
    &:focus
      outline none
    &:hover
      cursor pointer
      div
        opacity 1

#userText
  font-weight 900
  letter-spacing 1px
  margin-right 20px
  text-shadow 0 0 20px white
  user-select none
</style>
