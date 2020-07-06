<template>
  <main>
    <Account/>
    <Social/>
    <div id="launcherSpacer"></div>
    <Launch/>
  </main>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line

import Account from '@/components/landing/Account';
import Launch from '@/components/landing/Launch';
import Social from '@/components/landing/Social';

export default {
  name: 'overview',
  components: {
    Account,
    Launch,
    Social,
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

#launcherSpacer
  display flex
  flex-grow 1
</style>
