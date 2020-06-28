<template>
  <main id="welcomeContainer">
    <div id="welcomeContent">
      <img id="welcomeImageSeal" src="static/img/loading_seal.png"/>
      <h2 id="welcomeHeader">WELCOME</h2>
      <p id="welcomeDescription">Thanks for downloading our fork of the Helios Launcher. This launcher was designed to make modded Minecraft as easy as 1-2-3. Be sure to whitelist your Mojang account in the Discord, or you will not be able to join!</p>
      <h5 id="welcomeDescCTA">You are just a few clicks away!</h5>
      <router-link to="login" id="welcomeButton">
        CONTINUE <span>^</span>
      </router-link>
    </div>
  </main>
</template>

<script>
import {remote} from 'electron'; // eslint-disable-line

export default {
  name: 'welcome-page',
};
</script>

<style scoped lang="stylus">
.arrowLine
  fill none
  stroke #fff
  stroke-width 2px
  transition .25s ease

#welcomeButton
  background none
  border none
  color white
  font-weight bold
  letter-spacing 2px
  margin 5% 0 -5% 0
  padding 15px 5px
  position relative
  text-decoration none
  transition .5s ease
  &:active
    color #c7c7c7
    text-shadow 0 0 20px #c7c7c7
  &:disabled
    color rgba(255,255,255,.75)
    pointer-events none
  &:focus, &:hover
    text-shadow 0 0 20px #fff
    outline none
  span
    display inline-block
    transform rotate(90deg)

#welcomeContainer
  align-items center
  display flex
  height 100%
  justify-content center
  position relative
  width 100%

#welcomeContent
  align-items center
  display flex
  flex-direction column
  position relative
  top -10%
  width 50%

#welcomeDescription
  text-align justify
  text-shadow rgba(255,255,255,.75) 0 0 20px

#welcomeDescCTA
  font-size unset
  margin-block-end 1em
  margin-block-start 1em

#welcomeHeader
  font-family 'Avenir Medium'
  font-size 20px
  letter-spacing 1px

#welcomeImageSeal
  background rgba(1,2,1,.5)
  border 2px solid #cad7e1
  border-radius 50%
  box-shadow 0 0 10px 0 rgb(0,0,0)
  height 125px
  margin-bottom 5%
  margin-top 10%

#welcomeSVG
  height 10px
  margin-left 5px
  transform rotate(90deg)
  transition .25s ease
</style>
