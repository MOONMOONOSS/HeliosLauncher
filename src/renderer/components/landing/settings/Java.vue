<template>
  <div
    id="java"
    class="col"
  >
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
    <div class="header col item">
      Java Executable
    </div>
    <div class="col item">
      <div v-if="javaDeets && javaDeets.valid">
        <div id="java-version">
          Selected: Java
          {{ `${javaDeets.version.major} Update ${javaDeets.version.update} (x${javaDeets.arch})` }}
        </div>
        <div class="row">
          <div class="coffee-container">
            <img
              src="static/svg/coffee.svg"
              type="image/svg+xml"
            >
          </div>
          <input
            class="java-path"
            type="text"
            :value="selectedJavaExe"
            disabled
          >
          <button>Choose File</button>
        </div>
      </div>
      <div
        v-else
        id="java-error"
      >
        Java not detected
      </div>
    </div>
    <div
      v-if="javaDeets && javaDeets.valid"
      class="header col item"
    >
      Additional JVM Options
    </div>
    <div
      v-if="javaDeets && javaDeets.valid"
      class="col item"
    >
      <div class="row">
        <div class="coffee-container">
          <img
            src="static/svg/coffee.svg"
            type="image/svg+xml"
          >
        </div>
        <input
          class="java-path"
          type="text"
          spellcheck="false"
          :value="jvmOptions.join(' ')"
          @focusout="parseOpts"
        >
      </div>
      <div class="args-text">
        Options to be provided to the Java Virtual Machine at runtime.
        -Xms and -Xmx should not be included.<br>
        <a @click="openLink('https://docs.oracle.com/javase/8/docs/technotes/tools/windows/java.html')">
          Available Options for Java 8
        </a>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-return-assign */
import { shell } from 'electron'; // eslint-disable-line
import { mapActions, mapGetters, mapMutations } from 'vuex';

import RangeSlider from './general/RangeSlider';

export default {
  name: 'TabJava',
  components: {
    RangeSlider,
  },
  data: () => ({
    javaDeets: null,
    newArgs: null,
  }),
  computed: {
    ...mapGetters('Java', [
      'totalMemory',
      'availableMemory',
      'minRam',
      'maxRam',
      'javaDetails',
      'jvmOptions',
      'selectedJavaExe',
    ]),
  },
  mounted() {
    this.$nextTick(async () => {
      this.initSliders();

      this.javaDeets = await this.javaDetails();
    });
  },
  methods: {
    ...mapActions('Java', [
      'setMinRam',
      'setMaxRam',
    ]),
    ...mapMutations('Java', [
      'setJvmOpts',
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
    openLink(url) {
      shell.openExternal(url);
    },
    parseOpts(ev) {
      const { value } = ev.target;
      const newArr = value.split(' ');

      this.setJvmOpts(newArr);
    },
  },
};
</script>

<style scoped lang="stylus">
button
  background rgba(126,126,126,.57)
  border none
  border-radius 0 3px 3px 0
  color white
  transition .85s ease
  &:hover, &:focus
    cursor pointer
    outline none

header
  font-size 20px
  font-weight 900

img
  width 20px
  -webkit-user-drag none

input
  background rgba(0,0,0,.25)
  border 1px solid rgba(126,126,126,.57)
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

.args-text
  font-size 12px
  font-weight 900
  margin-top 15px
  a
    color grey
    cursor pointer
    text-decoration underline

.flex
  display flex

.coffee-container
  background rgba(126,126,126,.57)
  border-radius 3px 0 0 3px
  display flex
  padding 5px
  transition .25s ease

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
  margin 10px 0
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

.java-path
  flex-grow 1

#java
  display block
  max-height calc(100vh - 8rem)
  overflow-y auto
  div:first-child
    margin-top 0

#java-version
  color grey
  font-size 12px
  font-weight 900

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
