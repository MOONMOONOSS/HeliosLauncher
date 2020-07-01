<template>
  <main>
    <section>
      <div id="seal">
        <img class="avatar border-circle" src="static/img/loading_seal.png"/>
      </div>
      <div class="spacer"></div>
      <div id="user">
        <div id="userText">{{ username }}</div>
        <button class="avatar border-circle" :style="`background-image: url('https://crafatar.com/renders/body/${uuid}?size=70&default=MHF_Steve');`">
          <div>Edit</div>
        </button>
      </div>
    </section>
    <section class="float-right">
      test
    </section>
  </main>
</template>

<script>
import {remote, shell} from 'electron'; // eslint-disable-line

export default {
  name: 'overview',
  data: () => ({
    username: 'Dunkel is Dumb',
    uuid: 'ec91e5313da043c880b1dcfd0fa2dc18',
  }),
  methods: {
  },
};
</script>

<style scoped lang="stylus">
main
  display flex
  flex-direction column
  height calc(100% - 22px)
  margin-top 22px
  overflow-y hidden
  padding 0 10px
  transition background 2s ease

section
  display flex
  flex-direction row
  padding 0 10%
  justify-content space-between
  &:first-child
    padding-top 2rem

.avatar
  background-size contain
  background-position center
  background-repeat no-repeat
  height 70px
  width 70px

.border-circle
  border 2px solid #878787
  border-radius 50%

.float-right
  justify-content flex-end

#user
  align-items center
  display flex
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
  margin-right 20px
</style>
