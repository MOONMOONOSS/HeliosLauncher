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
    <div
      v-if="!module.required.required"
      class="buttonContainer"
      @click="toggleBtn()"
    >
      <label
        class="modButton"
        :checked="enabled"
      >
        <span
          class="slider"
          :checked="enabled"
        />
      </label>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'; // eslint-disable-line
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'ModItem',
  props: {
    module: Object,
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
.buttonContainer
  display inline-flex

.modButton
  align-self center
  background-color rgba(255,255,255,.35)
  border 1px solid rgba(126,126,126,.57)
  border-radius 50px
  height 20px
  width 40px
  &[checked]
    background-color rgb(31,140,11)
    border 1px solid rgb(31,140,11)
  &:hover
    cursor pointer

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

.slider
  &[checked]
    &::before
      transform translateX(20px)
  &::before
    background-color white
    border-radius 50px
    box-shadow 0 1px 2px 0 rgba(0,0,0,.75)
    content ""
    display inline-flex
    height 13px
    transform translateX(5px)
    transition .4s ease
    width 16px
</style>
