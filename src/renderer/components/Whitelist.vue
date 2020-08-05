<template>
  <main>
    <div id="stateContainer">
      <h1 class="underlined">
        Whitelisting
      </h1>
      <p>In order to play you must:</p>
      <ul>
        <li>Authorize the launcher to retrieve information about your Discord account</li>
        <li>Be in the MOONMOON subscriber Discord guild</li>
        <li>Not have the BACK TO THE PIT role on Discord</li>
      </ul>
      <div class="spacer underlined" />
      <div
        id="error"
        :hide="!hasError"
      >
        {{ errorText }}
      </div>
      <div>
        <button
          :disabled="linking"
          class="whitelistButton"
          @click="finish"
        >
          Link with Discord
        </button>
      </div>
    </div>
    <div
      v-if="linking"
      id="overlay"
    >
      {{ overlayText }}
    </div>
  </main>
</template>

<script>
import {remote, shell, ipcRenderer} from 'electron'; // eslint-disable-line
import { mapActions } from 'vuex';

export default {
  name: 'Whitelisting',
  data: () => ({
    errorText: 'Failed to whitelist your account!',
    hasError: false,
    overlayText: 'Continue on pop-up window',
    linking: false,
  }),
  mounted() {
    this.$nextTick(async () => {
      ipcRenderer.on('discord-code', (ev, data) => {
        if (data.code) {
          this.discordCode(data.code)
            .then(() => {
              this.overlayText = 'Contacting MOON2 Services';
              this.registerMcAccount();
            })
            .then(() => this.$router.push({ name: 'overview' }))
            .catch(() => {
              this.overlayText = 'Continue on pop-up window';
              this.linking = false;
              this.hasError = true;
            });
        } else {
          this.overlayText = 'Continue on pop-up window';
          this.linking = false;
          this.hasError = true;
        }
      });
    });
  },
  beforeUnmount() {
    ipcRenderer.removeAllListeners('discord-code');
  },
  methods: {
    finish() {
      this.linking = true;
      ipcRenderer.send('discord-oauth', 'test');
    },
    ...mapActions('Account', [
      'discordCode',
      'registerMcAccount',
    ]),
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

#error
  color red
  margin-bottom 10px
  text-shadow 0 0 20px red
  transition all .85s ease
  &[hide]
    opacity 0
    transform translateY(-20px)

#overlay
  align-items center
  background rgba(0,0,0,.75)
  display flex
  font-size x-large
  height 100%
  justify-content center
  position absolute
  width 100%
  z-index 2

#stateContainer
  align-items center
  display flex
  flex-direction column
  height 100%
  justify-content center
</style>
