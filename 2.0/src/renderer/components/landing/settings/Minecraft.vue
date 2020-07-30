<template>
  <div class="col">
    <header>Minecraft Settings</header>
    <summary class="header">
      Game options related to launching Minecraft.
    </summary>
    <div
      id="settings"
      class="header col item"
    >
      <div>Game Resolution</div>
      <div>
        <input
          type="number"
          min="800"
          default="1280"
        >
        ✖
        <input
          type="number"
          min="600"
          default="720"
        >
      </div>
    </div>
    <div class="header item glow space-between">
      <div>Launch in fullscreen.</div>
      <SliderButton
        :checked="false"
      />
    </div>
    <div class="header item glow space-between">
      <div>Connect to server automatically when I press 'Play'</div>
      <SliderButton
        :checked="true"
      />
    </div>
  </div>
</template>

<script>
import SliderButton from './general/SliderButton';

export default {
  name: 'TabMinecraft',
  components: {
    SliderButton,
  },
  computed: {
  },
  methods: {
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

input
  background rgba(0,0,0,.25)
  border 1px solid rgba(126,126,126,.57)
  border-radius 3px
  color white
  font-family 'Avenir Book'
  padding 8px 5px
  transition .25s ease
  width 75px
  &:focus
    border-color rgba(126,126,126,.87)
    outline none
  &::-webkit-inner-spin-button
    -webkit-appearance none

summary
  margin-bottom 20px
  // I am no longer asking
  padding-top 0 !important

.col
  display flex
  flex-direction column

.glow
  transition background-color .85s ease
  &:hover
    background-color rgba(255,255,255,.2)

.header
  border-bottom 1px solid rgba(255,255,255,.5)
  font-size 16px
  padding-bottom 15px
  padding-top 15px

.item
  padding-left 1rem
  padding-right 1rem

.space-between
  display flex
  justify-content space-between

#settings
  padding-top 0
</style>
