<template>
  <div class="modItem">
    <div class="modInfo">
      <div class="modTitle">
        {{ module.name }}
      </div>
      <div class="modVersion">
        {{ module.artifactVersion }}
      </div>
    </div>
    <SliderButton
      v-if="!module.required.required"
      :checked="enabled"
      @toggle="toggleBtn()"
    />
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'; // eslint-disable-line
import { mapActions, mapGetters } from 'vuex';

import SliderButton from '../general/SliderButton';

export default {
  name: 'ModItem',
  components: {
    SliderButton,
  },
  props: {
    module: {
      type: Object,
      default: () => ({
        name: 'An Undefined Mod',
        artifactVersion: '1.2.3',
        required: {
          required: true,
        },
      }),
    },
  },
  data: () => ({
    enabled: null,
  }),
  computed: {
    ...mapGetters('Distribution', [
      'optionalStatus',
    ]),
  },
  mounted() {
    this.$nextTick(() => {
      this.updateEnableState();
    });
  },
  methods: {
    ...mapActions('Distribution', [
      'setOptional',
    ]),
    async toggleBtn() {
      await this.setOptional({
        id: this.module.id,
        enabled: !this.enabled,
      });
      this.updateEnableState();
    },
    updateEnableState() {
      const status = this.optionalStatus(this.module.id);
      if (status) {
        this.enabled = this.optionalStatus(this.module.id).enabled;
      }
    },
  },
};
</script>

<style scoped lang="stylus">
.modItem
  border-radius 5px
  display flex
  justify-content space-between
  padding 5px 15px
  transition .85s ease
  &[required]
    &:hover
      cursor pointer
  &:hover
    background rgba(255,255,255,.2)

.modTitle
  font-size 16px
  font-weight 900

.modVersion
  color gray
  font-size 12px
</style>
