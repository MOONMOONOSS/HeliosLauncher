<template>
  <vue-markdown
    :id="elementName"
    :html="false"
    :breaks="false"
    :task-lists="false"
    :prerender="preRender"
    :postrender="postRender"
    class="chat-entry"
  >
    {{ contents }}
  </vue-markdown>
</template>

<script>
import VueMarkdown from 'vue-markdown-plus';

import ChatHelper from '@/js/chatHelper';
import FormatHelper from '@/js/formatHelper';

export default {
  name: 'GenericEntry',
  components: {
    VueMarkdown,
  },
  props: {
    obj: {
      type: Object,
      default: () => ({
        msg: 'This is a placeholder message body.',
        id: 0,
      }),
    },
    parser: {
      type: Object,
      default: null,
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
      return ChatHelper.elementName(this.obj.id);
    },
    contents() {
      return ChatHelper.getContents(this.obj);
    },
  },
  mounted() {
    this.$nextTick(() => {
      document
        .getElementById(this.elementName)
        .animate(this.hideKeyframes, this.hideTiming);
    });
  },
  methods: {
    preRender(val) {
      return FormatHelper.parseTextFormatters(val);
    },
    postRender(val) {
      const color = FormatHelper.parseColorFormatters(val);

      return FormatHelper.parseEmotes(color, this.parser);
    },
  },
};
</script>

<style scoped lang="stylus">
.chat-entry
  background rgba(0,0,0,.2)
</style>

<style lang="stylus">
p
  display flex
  margin 0

.twitch-emote
  height 22px
</style>
