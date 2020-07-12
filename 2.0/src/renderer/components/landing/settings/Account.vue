<template>
  <div id="account">
    <header>Account Settings</header>
    <summary>Manage your existing account.</summary>
    <div id="mcInfo">
      <div id="skin">
        <img :alt="username" :src="crafatar"/>
      </div>
      <div id="metadata">
        <div class="flex-col">
          <div class="head-text">Username</div>
          <div>{{ username }}</div>
        </div>
        <div class="flex-col">
          <div class="head-text">UUID</div>
          <div>{{ uuid }}</div>
        </div>
      </div>
      <div id="logout">
        <button @click="logoff()">Log Out</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'; // eslint-disable-line
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'tab-account',
  computed: {
    ...mapGetters('Landing', ['crafatar']),
    ...mapGetters('Account', [
      'accessToken',
      'clientToken',
      'username',
      'uuid',
    ]),
  },
  methods: {
    ...mapActions('Account', [
      'discordReset',
      'minecraftReset',
    ]),
    logoff() {
      const { accessToken, clientToken } = this;

      ipcRenderer.invoke('minecraft-logout', JSON.stringify({
        accessToken,
        clientToken,
      }))
        .then(() => console.log('Logout Success'))
        .then(() => this.minecraftReset())
        .then(() => this.discordReset())
        .then(() => this.$router.push({ name: 'minecraft-login' }))
        .catch(err => new Error(err));
    },
  },
};
</script>

<style scoped lang="stylus">
button
  background none
  border 2px solid rgb(241, 55, 55)
  border-radius 5px
  color rgb(241, 55, 55)
  transition .85s ease
  &:hover, &:focus
    box-shadow 0 0 20px rgb(241, 55, 55)
    cursor pointer
    outline none

header
  font-size 20px
  font-weight 900

.flex-col
  display flex
  flex-direction column

.head-text
  color gray
  font-weight 900

#account
  display flex
  flex-direction column

#logout
  align-items flex-end
  display flex
  margin 5px

#mcInfo
  background rgba(0,0,0,.25)
  border 1px solid rgba(126,126,126,.57)
  display flex
  margin-top 2rem
  width 100%

#metadata
  display flex
  flex-direction column
  flex-grow 1
  font-size 14px
  justify-content space-evenly

#skin
  display flex
  margin 5px 15px
  img
    height 125px
</style>
