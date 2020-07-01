<template>
  <main>
    <div id="stateContainer">
      <h1 class="underlined">Whitelisting</h1>
      <p>In order to play you must:</p>
      <ul>
        <li>Authorize the launcher to retrieve information about your Discord account</li>
        <li>Be in the MOONMOON subscriber Discord guild</li>
        <li>Not have the BACK TO THE PIT role on Discord</li>
      </ul>
      <div class="spacer underlined"></div>
      <div>
        <button @click="finish" class="whitelistButton">Link with Discord</button>
      </div>
    </div>
  </main>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line

export default {
  name: 'whitelisting',
  data: () => ({
  }),
  methods: {
    finish() {
      this.$router.push({ name: 'overview' });
    },
  },
};
</script>

<style scoped lang="stylus">
h1
  text-align center

main
  align-items center
  background-color rgba(0,0,0,.6)
  display flex
  flex-direction column
  height 100%
  justify-content center
  width 100%

p
  letter-spacing 1px
  text-shadow 0 0 20px black

.spacer
  margin 1rem 0 2rem 0

.underlined
  border-bottom white 1px solid
  width 100%

.whitelistButton
  background none
  border white 1px solid
  cursor pointer
  font-size 18px
  font-weight 900
  letter-spacing 1px
  outline none
  padding .75rem
  text-shadow 0 0 20px black
  transition .25s ease
  &:hover
    box-shadow 0 0 1rem rgba(255,255,255,.5)

#stateContainer
  align-items center
  display flex
  flex-direction column
  height 100%
  justify-content center
</style>
