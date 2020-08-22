<template>
  <div
    :id="elementName"
    class="chat-entry"
  >
    &lt;{{ player }}&gt; {{ message }}
  </div>
</template>

<script>
export default {
  name: 'BasicEntry',
  props: {
    player: {
      type: String,
      default: 'Player309',
    },
    message: {
      type: String,
      default: 'This is a placeholder message body.',
    },
    msgId: {
      type: Number,
      default: 0,
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
    elementName() {
      return `chat-entry-${this.msgId}`;
    },
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
