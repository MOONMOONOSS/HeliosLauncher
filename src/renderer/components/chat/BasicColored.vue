<template>
  <div
    :id="elementName"
    :style="elementColor"
    class="chat-entry"
  >
    {{ contents }}
  </div>
</template>

<script>
import ChatHelper from '@/js/chatHelper';
import ColorEnum from '@/js/colorEnums';

export default {
  name: 'BasicColored',
  props: {
    obj: {
      type: Object,
      default: () => ({
        color: 'white',
        msg: 'This is a placeholder message body.',
        id: 0,
      }),
    },
  },
  data: () => ({
    hideKeyframes: [
      { // from
        opacity: '1',
      },
      { // to
        opacity: '0',
      },
    ],
    hideTiming: {
      delay: 5000,
      duration: 5000,
      fill: 'forwards',
      iterations: 1,
    },
  }),
  computed: {
    elementName: () => ChatHelper.elementName(this.obj.id),
    elementColor: () => `color: ${ColorEnum.enumToHex(this.obj.color)};`,
    contents: () => ChatHelper.getContents(this.obj),
  },
  mounted() {
    this.$nextTick(() => {
      document
        .getElementById(this.elementName)
        .animate(this.hideKeyframes, this.hideTiming);
    });
  },
};
</script>

<style scoped lang="stylus">
.chat-entry
  background rgba(0,0,0,.2)
</style>
