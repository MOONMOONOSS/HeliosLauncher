<template>
  <main id="loginContainer">
    <div id="loginContent">
      <form v-on:submit.prevent="onSubmit" id="loginForm">
        <img id="loginImageSeal" src="static/img/logoAnim.gif"/>
        <h1 id="loginSubheader">MINECRAFT LOGIN</h1>
        <div class="loginFieldContainer">
          <div class="loginField">
            <svg class="loginSVG" viewBox="40 37 65.36 61.43">
              <g>
                <path d="M86.77,58.12A13.79,13.79,0,1,0,73,71.91,13.79,13.79,0,0,0,86.77,58.12M97,103.67a3.41,3.41,0,0,0,3.39-3.84,27.57,27.57,0,0,0-54.61,0,3.41,3.41,0,0,0,3.39,3.84Z"/>
              </g>
            </svg>
            <input id="mcUsername" v-model="loginData.username" type="text" placeholder="EMAIL/USERNAME" required/>
          </div>
        </div>
        <div class="loginFieldContainer">
          <div class="loginField">
            <svg class="loginSVG" viewBox="40 32 60.36 70.43">
              <g>
                <path d="M86.16,54a16.38,16.38,0,1,0-32,0H44V102.7H96V54Zm-25.9-3.39a9.89,9.89,0,1,1,19.77,0A9.78,9.78,0,0,1,79.39,54H60.89A9.78,9.78,0,0,1,60.26,50.59ZM70,96.2a6.5,6.5,0,0,1-6.5-6.5,6.39,6.39,0,0,1,3.1-5.4V67h6.5V84.11a6.42,6.42,0,0,1,3.39,5.6A6.5,6.5,0,0,1,70,96.2Z"/>
              </g>
            </svg>
            <input id="mcPassword" v-model="loginData.password" type="password" placeholder="PASSWORD" required/>
          </div>
        </div>
        <div id="loginOptions">
          <span class="loginSpanDim">
            <a @click="openLink('https://my.minecraft.net/en-us/password/forgot/')">Forgot password?</a>
          </span>
          <label id="checkmarkContainer">
            <input v-model="loginData.remember" id="loginRememberOption" type="checkbox" checked>
            <span id="loginRememberText" class="loginSpanDim">Remember me?</span>
            <span class="loginCheckmark"></span>
          </label>
        </div>
        <button id="loginButton">
          <div id="loginButtonContent">
            LOGIN <span>^</span>
            <div class="circle-loader" hide>
              <div class="checkmark draw"></div>
            </div>
          </div>
        </button>
        <div id="loginDisclaimer">
          <span class="loginSpanDim" id="loginRegisterSpan">
            <a @click="openLink('https://minecraft.net/en-us/store/minecraft/')">Need an Account?</a>
          </span>
          <p>Your password is sent directly to mojang and never stored.</p>
          <p>MOON2 Launcher is not affiliated with Mojang AB.</p>
        </div>
      </form>
    </div>
  </main>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line

export default {
  name: 'minecraft-login',
  data: () => ({
    loginData: {
      username: '',
    },
  }),
  methods: {
    onSubmit() {
      this.$router.push({ name: 'whitelisting' });
    },
    openLink(url) {
      shell.openExternal(url);
    },
  },
};
</script>

<style scoped lang="stylus">
@keyframes checkmark
  0%
    height 0
    opacity 1
    width 0
  20%
    height 0
    opacity 1
    width 4px
  40%
    height 8px
    opacity 1
    width 4px
  100%
    height 8px
    opacity 1
    width 4px

@keyframes loader-spin
  0%
    transform rotate(0deg)
  100%
    transform rotate(360deg)

.checkmark
  display none
  &:after
    border-right 2px solid #fff
    border-top 2px solid #fff
    content ''
    height 8px
    left 2px
    opacity 1
    position absolute
    top 8px
    transform-origin left top
    width 4px
  .draw:after
    animation 800ms ease checkmark
    transform scaleX(-1) rotate(135deg)

.circle-loader
  animation 1s linear infinite loader-spin
  border 2px solid rgba(255,255,255,.5)
  border-left-color #fff
  border-radius 50%
  display inline-block
  height 16px
  margin-left 10px
  width 16px
  &[hide]
    display none

.loginCheckmark
  background none
  border 1px solid #848484
  border-radius 1px
  height 10px
  position relative
  transition .25s ease
  width 10px
  // Create the checkmark/indicator (hidden when not checked).
  &:after
    content ""
    display none

.loginField
  border-color #fff
  border-style solid
  border-width 0 0 1.5px 0
  display flex
  padding-top 16px
  width 250px
  input
    background none
    border none
    box-sizing border-box
    color rgba(255,255,255,.75)
    font-family 'Avenir Book'
    font-weight bold
    letter-spacing 1px
    padding 7.5px
    width -webkit-fill-available
    &:disabled
      color rgba(255,255,255,.5)
    &:focus
      outline none
    &:focus::-webkit-input-placeholder
      color transparent
    &::-webkit-input-placeholder
      color rgba(255,255,255,.75)
      font-weight bold
      text-align center

.loginFieldContainer
  align-items center
  display flex
  flex-direction column
  position relative
  justify-content center

.loginSpanDim
  color #848484
  font-size 12px
  font-weight bold

.loginSVG
  display inline-block
  fill #fff
  height 20px
  margin auto 5px

#checkmarkContainer
  align-items center
  cursor pointer
  display flex
  font-size 22px
  position relative
  justify-content flex-end
  user-select none
  &[disabled]
    pointer-events none
  // On hover and focus, add a grey border color.
  &:hover input ~ *, input:focus ~ *
    border-color #a2a2a2
    color #a2a2a2
  // On keydown, darken the checkbox a bit.
  input:active ~ *:not(#loginRememberText)
    border-color #8d8d8d
    color #8d8d8d
  // Show the checkmark when checked.
  input:checked ~ .loginCheckmark:after
    display block
  // Style the checkmark/indicator
  .loginCheckmark:after
    border solid #a2a2a2
    border-width 0 2px 2px 0
    height 6px
    left 3.5px
    top .5px
    transform rotate(125deg) scaleY(-1)
  input
    cursor pointer
    opacity 0
    position absolute

#loginButton
  background none
  border none
  cursor pointer
  font-weight bold
  letter-spacing 2px
  padding 15px 5px
  position relative
  transition .5s ease
  &:active
    color #c7c7c7
    text-shadow 0 0 20px #c7c7c7
    #loginButtonContent > span
      filter drop-shadow(0 0 2px #c7c7c7)
  &:disabled
    color rgba(255,255,255,.75)
    pointer-events none
  &:focus, &:hover
    outline none
    text-shadow 0 0 20px #fff
    #loginButtonContent > span
      filter drop-shadow(0 0 2px #fff)
  &[loading]
    color #fff

#loginButtonContent
  align-items center
  display flex
  span
    display inline-block
    transform rotate(90deg)
    &[hide]
      display none

#loginContainer
  align-items center
  background rgba(0,0,0,.5)
  display flex
  height 100%
  position relative
  justify-content center
  transition filter .25s ease
  width 100%

#loginContent
  align-items center
  display flex
  height 100%
  padding 0 25px
  justify-content center

#loginDisclaimer
  align-items center
  display flex
  flex-direction column
  p
    color #848484
    font-size 12px
    font-weight bold
    margin 0
    text-align center

#loginForm
  align-items center
  display flex
  flex-direction column
  justify-content center
  a
    color #848484
    text-decoration none
    transition .25s ease
    &:active
      color #8b8b8b
    &:focus, &:hover
      color #a2a2a2
      cursor pointer
      outline none

#loginImageSeal
  background rgba(1,2,1,.5)
  border 2px solid #cad7e1
  border-radius 50%
  box-shadow 0 0 10px 0 rgb(0,0,0)
  height 125px
  margin-bottom 20px

#loginOptions
  display flex
  margin 10px 0
  justify-content space-between
  width 100%

#loginRememberText
  padding-right 10px
  transition .25s ease

#loginSubheader
  margin-block-start 0
</style>
