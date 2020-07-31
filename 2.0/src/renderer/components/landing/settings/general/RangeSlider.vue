<template>
  <div
    ref="slider"
    class="range-slider"
    :min="min"
    :max="max"
    :value="value"
    step="0.5"
  >
    <div
      ref="bar"
      class="slider-bar"
    />
    <div
      ref="track"
      class="slider-track"
      @mousedown="trackMouseDown"
    />
  </div>
</template>

<script>
export default {
  name: 'RangeSlider',
  props: {
    min: {
      type: Number,
      default: 3,
    },
    max: {
      type: Number,
      default: 4,
    },
    value: {
      type: Number,
      default: 3,
    },
  },
  emits: ['change'],
  data: () => ({
    mouseUpListener: null,
    mouseMoveListener: null,
    curValue: 1,
  }),
  methods: {
    calculateRangeSliderMeta(v) {
      const { max, min, step } = v;
      const val = {
        max: Number(max.value),
        min: Number(min.value),
        step: Number(step.value),
      };

      val.ticks = (val.max - val.min) / val.step;
      val.inc = 100 / val.ticks;

      return val;
    },
    updateRangedSlider(value, notch) {
      const { slider, track, bar } = this.$refs;

      if (this.curValue && this.curValue !== value) {
        this.curValue = value;
        this.$emit('change', {
          notch,
          value,
        });
      }
      slider.setAttribute('value', value);

      if (notch < 0) {
        notch = 0;
      } else if (notch > 100) {
        notch = 100;
      }

      track.style.left = `${notch}%`;
      bar.style.width = `${notch}%`;
    },
    trackMouseDown() {
      /**
       * A reference to the slider's DOM Element
       */
      const { slider, track } = this.$refs;
      /**
       * A NamedNodeMap of attributes on the slider DOM Element
       */
      const { attributes } = slider;

      if (!attributes.value?.value) {
        slider.setAttribute('value', attributes.min.value);
      }

      const value = Number(attributes.value.value);

      const sliderMeta = this.calculateRangeSliderMeta(attributes);

      this.updateRangedSlider(value, ((value - sliderMeta.min) / sliderMeta.step) * sliderMeta.inc);

      // Remove event handlers on mouse up
      this.mouseUpListener = () => {
        document.removeEventListener('mousemove', this.mouseMoveListener);
        document.removeEventListener('mouseup', this.mouseUpListener);
      };
      document.addEventListener('mouseup', this.mouseUpListener);

      this.mouseMoveListener = (moveEv) => {
        /**
         * Distance from the beginning of the bar in px
         */
        const diff = moveEv.pageX - slider.offsetLeft - track.offsetWidth / 2;
        // Don't move track off slider
        if (diff >= 0 && diff <= slider.offsetWidth - track.offsetWidth / 2) {
          /**
           * Distance from the beginning of the bar in percent
           */
          const perc = (diff / slider.offsetWidth) * 100;
          /**
           * The closest notch as a percentage
          */
          const notch = Number(perc / sliderMeta.inc).toFixed(0) * sliderMeta.inc;

          // If we're close to the notch, clamp to it.
          if (Math.abs(perc - notch) < sliderMeta.inc / 2) {
            this.updateRangedSlider(sliderMeta.min
              + (sliderMeta.step * (notch / sliderMeta.inc)),
            notch);
          }
        }
      };

      document.addEventListener('mousemove', this.mouseMoveListener);
    },
  },
};
</script>

<style scoped lang="stylus">
.align-center
  align-items center

.flex
  display flex

.space-between
  @extend .flex
  justify-content space-between

.range-slider
  background grey
  height 5px
  margin 15px 0
  width 100%

.slider-bar
  background #8be88b
  height 5px
  transition width .85s ease

.slider-container
  @extends .space-between, .align-center

.slider-track
  background white
  border-radius 3px
  cursor ew-resize
  display inline-flex
  height 20px
  position relative
  transform translateY(-12.5px)
  transition left .2s ease
  width 7px
</style>
