<template>
  <div class="col">
    <header>JVM Settings (Advanced)</header>
    <summary>
      Options related to the Java Virtual Machine.
    </summary>
    <div
      id="settings"
      class="header col item"
    >
      Memory
    </div>
    <div class="row item space-between">
      <div
        id="sliders"
        class="col grow"
      >
        <div class="col">
          <div>Maximum RAM</div>
          <RangeSlider
            :max="availableMemory"
            :value="maxRam"
            @change="updateMaxRam"
          />
        </div>
        <div class="col">
          <div>Minimum RAM</div>
          <RangeSlider
            :max="availableMemory"
            :value="minRam"
            @change="updateMinRam"
          />
        </div>
        <div
          id="memory-info"
          class="col"
        >
          The minimum RAM required to use MOON2 Launcher is 3GB. Setting
          the minimum and maximum values to the same value may reduce lag.
        </div>
      </div>
      <div
        id="memory"
        class="col"
      >
        <div class="col align-center">
          <div class="mem-title">
            Total
          </div>
          <div>{{ totalMemory }} GB</div>
        </div>
        <div class="col align-center">
          <div class="mem-title">
            Available
          </div>
          <div>{{ availableMemory }} GB</div>
        </div>
      </div>
    </div>
    <div class="spacer header item" />
    <div
      id="java"
      class="header col item"
    >
      Java Executable
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import RangeSlider from './general/RangeSlider';

export default {
  name: 'TabJava',
  components: {
    RangeSlider,
  },
  computed: {
    ...mapGetters('Java', [
      'totalMemory',
      'availableMemory',
      'minRam',
      'maxRam',
    ]),
  },
  mounted() {
    this.$nextTick(() => {
      this.initSliders();
    });
  },
  methods: {
    ...mapActions('Java', [
      'setMinRam',
      'setMaxRam',
    ]),
    updateMinRam(data) {
      this.setMinRam(data.value);

      if (data.value > this.maxRam) {
        this.$children[0].updateRangedSlider(data.value, data.notch);
      }
    },
    updateMaxRam(data) {
      this.setMaxRam(data.value);

      if (data.value < this.minRam) {
        this.$children[1].updateRangedSlider(data.value, data.notch);
      }
    },
    initSliders() {
      const { slider } = this.$children[0].$refs;
      const { attributes } = slider;
      const sliderMeta = this.$children[0].calculateRangeSliderMeta(attributes);

      // Max RAM
      this.$children[0].updateRangedSlider(
        this.maxRam,
        ((this.maxRam - sliderMeta.min) / sliderMeta.step) * sliderMeta.inc,
      );

      // Min RAM
      this.$children[1].updateRangedSlider(
        this.minRam,
        ((this.minRam - sliderMeta.min) / sliderMeta.step) * sliderMeta.inc,
      );
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
  margin-bottom 10px

.align-center
  align-items center

.flex
  display flex

.col
  @extend .flex
  flex-direction column

.space-between
  @extend .flex
  justify-content space-between

.glow
  transition background-color .85s ease
  &:hover
    background-color rgba(255,255,255,.2)

.grow
  flex-grow 1

.header
  border-bottom 1px solid rgba(255,255,255,.5)
  font-size 16px
  margin-bottom 10px
  min-width 20ch
  padding-bottom 5px
  width 20%

.item
  padding-left 1rem
  padding-right 1rem

.mem-title
  color grey
  font-size 14px

.row
  @extend .flex
  flex-direction row

.spacer
  margin-top 10px
  width 100%

#memory
  justify-content space-evenly
  min-width 10ch

#memory-info
  font-size 12px
  font-weight 900

#settings
  padding-top 0

#sliders
  padding-right 2rem
</style>
