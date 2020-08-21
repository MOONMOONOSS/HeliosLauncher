<template>
  <div class="chat-entry">
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
  },
};
</script>

<style scoped lang="stylus">

</style>
