<template>
  <section>
    <div id="seal">
      <img class="avatar border-circle" src="static/img/loading_seal.png"/>
    </div>
    <div class="spacer"></div>
    <div id="user">
      <aside>
        <div id="userText">{{ username }}</div>
        <div id="whitelist-text" :class="wlStatus">{{ wlText }}</div>
      </aside>
      <button class="avatar border-circle" :style="`background-image: url('https://crafatar.com/renders/body/${uuid}?size=70&default=MHF_Steve');`">
        <div>Edit</div>
      </button>
    </div>
  </section>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'account',
  data: () => ({
    wlText: 'Checking Status...',
    wlStatus: 'checking',
  }),
  mounted() {
    this.$nextTick(() => {
      setTimeout(async () => {
        await this.whitelistStatus
          .then(result => this.updateWl(result))
          .catch(async (err) => {
            switch (err.message) {
              case 'Error invoking remote method \'whitelist-status\': Error: REFRESH':
                console.log('Refreshing Discord token');
                await this.discordRefresh()
                  .then(() => this.getWlStatus())
                  .catch(() => this.$router.push({ name: 'whitelisting' }));
                break;
              case 'Error invoking remote method \'whitelist-status\': Error: Not Found':
                // eslint-disable-next-line no-console
                console.warn('User is not in database!');
                await this.discordReset()
                  .then(() => this.$router.push({ name: 'whitelisting' }));
                break;
              default:
                throw new Error(err.message);
            }
          });
      }, 3000);
    });
  },
  methods: {
    ...mapActions('Account', [
      'discordRefresh',
      'discordReset',
    ]),
    updateWl(result) {
      if (result.status === 0) {
        this.wlText = 'Whitelisted';
        this.wlStatus = 'whitelisted';
      } else {
        this.wlText = 'Suspended';
        this.wlStatus = 'suspended';
      }
    },
    async getWlStatus() {
      await this.whitelistStatus
        .then(result => this.updateWl(result));
    },
  },
  computed: {
    ...mapGetters('Account', [
      'username',
      'uuid',
      'whitelistStatus',
    ]),
  },
};
</script>

<style scoped lang="stylus">
@keyframes red-glow
  0%
    text-shadow 0 0 0 none
  50%
    text-shadow 0 0 10px red
  0%
    text-shadow 0 0 0 none

a, button
  &:hover, &:focus
    cursor pointer
    outline none

section
  display flex
  flex-direction row
  padding 0 10%
  padding-top 2rem
  justify-content space-between

.avatar
  background-size contain
  background-position center
  background-repeat no-repeat
  height 70px
  width 70px

.border-circle
  border 2px solid #878787
  border-radius 50%

.checking
  color darkgray
  text-shadow 0 0 10px darkgray

.suspended
  animation 2s ease infinite running red-glow
  color red

.whitelisted
  color yellowgreen
  text-shadow 0 0 10px yellowgreen

#user
  align-items center
  display flex
  aside
    display text
    flex-direction column
    text-align end
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

#whitelist-text
  font-weight 900
  margin-right 20px
  transition .85s ease
</style>
