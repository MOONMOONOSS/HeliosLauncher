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
    <Social/>
    <div id="launcherSpacer"></div>
    <Launch/>
  </main>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line

import Launch from '@/components/landing/Launch';
import Social from '@/components/landing/Social';

export default {
  name: 'overview',
  components: {
    Launch,
    Social,
  },
  data: () => ({
    username: 'Dunkel is Dumb',
    uuid: 'ec91e5313da043c880b1dcfd0fa2dc18',
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
    *
      height 25px
      width 25px
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

#gameLaunch
  align-items center
  margin-bottom 5rem

// Cannot be scoped into Launch.vue for some reason
#launcherSpacer
  display flex
  flex-grow 1

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
