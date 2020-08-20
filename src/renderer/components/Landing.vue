<template>
  <main>
    <Settings />
    <SkinEditor />
    <ServerSelector />
    <Account />
    <Social />
    <div id="launcherSpacer" />
    <Launch />
  </main>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line

import Account from '@/components/landing/Account';
import Launch from '@/components/landing/Launch';
import ServerSelector from '@/components/landing/ServerSelector';
import Settings from '@/components/landing/Settings';
import Social from '@/components/landing/Social';
import SkinEditor from '@/components/landing/SkinEditor';

export default {
  name: 'Overview',
  components: {
    Account,
    Launch,
    ServerSelector,
    Settings,
    Social,
    SkinEditor,
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
  flex-grow 1
  height 100%
  overflow-y hidden
  padding 0 10px
  transition background 2s ease

#launcherSpacer
  display flex
  flex-grow 1
</style>
