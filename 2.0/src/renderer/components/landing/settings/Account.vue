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
    </div>
  </div>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line
import { mapGetters } from 'vuex';

export default {
  name: 'tab-account',
  computed: {
    ...mapGetters('Landing', ['crafatar']),
    ...mapGetters('Account', [
      'username',
      'uuid',
    ]),
  },
  methods: {
  },
};
</script>

<style scoped lang="stylus">
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
