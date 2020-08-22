<template>
  <div
    :id="elementName"
    class="chat-entry"
  >
    &lt;{{ obj.player }}&gt; {{ obj.msg }}
  </div>
</template>

<script>
export default {
  name: 'BasicPlayer',
  props: {
    obj: {
      type: Object,
      default: () => ({
        player: 'Player309',
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
    elementName() {
      return `chat-entry-${this.obj.id}`;
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
