<template>
  <section>
    <div id="seal">
      <img class="avatar border-circle" src="static/img/loading_seal.png"/>
    </div>
    <div class="spacer"></div>
    <div id="user">
      <aside>
        <div id="userText">{{ username }}</div>
        <div id="whitelisted">Whitelisted</div>
      </aside>
      <button class="avatar border-circle" :style="`background-image: url('https://crafatar.com/renders/body/${uuid}?size=70&default=MHF_Steve');`">
        <div>Edit</div>
      </button>
    </div>
  </section>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line
import { mapGetters } from 'vuex';

export default {
  name: 'account',
  data: () => ({
  }),
  methods: {
  },
  computed: {
    ...mapGetters('Account', [
      'username',
      'uuid',
    ]),
  },
};
</script>

<style scoped lang="stylus">
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

#whitelisted
  color yellowgreen
  font-weight 900
  margin-right 20px
  text-shadow 0 0 20px yellowgreen
</style>
