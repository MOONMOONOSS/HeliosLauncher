<template>
  <dialog
    id="editor"
    :hide="!isSkinEditOpen"
  >
    <div id="container">
      <header>
        <div id="windowTitle">
          Minecraft Skin Selector
        </div>
        <button
          id="close"
          @click="closeWindow()"
        >
          <svg
            name="titleBarClose"
            width="10"
            height="10"
            viewBox="0 0 12 12"
          >
            <polygon
              stroke="#ffffff"
              fill="#ffffff"
              fill-rule="evenodd"
              points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11
                1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
            />
          </svg>
        </button>
      </header>
      <main>
        <div id="editorContents">
          <img :src="crafatar">
          <img
            id="arrow"
            src="static/svg/arrow_right.svg"
            type="image/svg+xml"
          >
          <img
            :src="imageBlobUrl"
            :selected="filePicked"
          >
        </div>
        <div id="fileSelector">
          <button @click="openFileSelector()">
            Choose Skin
          </button>
          <button
            :disabled="!filePicked"
            @click="uploadSkin()"
          >
            Upload Skin
          </button>
        </div>
      </main>
    </div>
  </dialog>
</template>

<script>
import { ipcRenderer } from 'electron'; // eslint-disable-line
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: 'SkinEditor',
  data: () => ({
    filePicked: false,
    blobbedContents: null,
    fileName: null,
  }),
  computed: {
    ...mapGetters('Account', [
      'accessToken',
      'uuid',
    ]),
    ...mapGetters('Landing', [
      'crafatar',
      'isSkinEditOpen',
    ]),
    imageBlobUrl() {
      if (this.blobbedContents) {
        return URL.createObjectURL(this.blobbedContents);
      }
      // Return default image if null
      return 'static/img/UnknownSkin.png';
    },
  },
  methods: {
    ...mapMutations('Account', ['skinChangeTime']),
    ...mapMutations('Landing', ['skinVisibility']),
    async openFileSelector() {
      const contents = await ipcRenderer.invoke('file-selector');
      this.blobbedContents = new Blob([new Uint8Array(contents.data)]);
      this.fileName = contents.fileName;
      this.filePicked = true;
    },
    closeWindow() {
      this.filePicked = null;
      this.blobbedContents = null;
      this.fileName = null;

      this.skinVisibility(false);
    },
    uploadSkin() {
      if (
        this.accessToken
        && this.uuid
        && this.fileName
      ) {
        ipcRenderer.invoke('skin-upload', {
          token: this.accessToken,
          uuid: this.uuid,
          filePath: this.fileName,
          skinType: '',
        })
          .then(() => {
            this.closeWindow();
            this.skinChangeTime(Date.now());
          })
          // eslint-disable-next-line no-console
          .catch((err) => console.error('Failed to upload skin!', err));
      }
    },
  },
};
</script>

<style scoped lang="stylus">
button
  background none
  border none
  transition .85s ease
  &:focus, &:hover
    color #c1c1c1
    cursor pointer
    outline none

dialog
  border none
  color white

header
  background rgba(0,0,0,.5)
  display flex
  justify-content space-between
  position relative
  top -6px
  // Pesky borders!
  width calc(100% + 10px)

main
  // Remove styling from App.vue
  background none
  display flex
  flex-direction column
  // 100% of the overlay container div
  // minus the size of the close button
  height calc(100% - 23px)
  justify-content space-around
  width 100%

#arrow
  height 90px
  margin auto 0

#close
  border-top-right-radius 8px
  height 22px
  position relative
  width 39px
  &:focus, &:hover
    background rgba(255,53,53,.61)

#container
  align-items center
  background-color #36393f
  border 5px solid #36393f
  border-radius 8px
  display flex
  flex-direction column
  height 50vh
  width 70vw

#editor
  align-items center
  background rgba(0,0,0,.85)
  display flex
  left 0
  height 100%
  justify-content center
  padding 0 8rem
  position absolute
  transition .85s ease
  width calc(100vw - 16rem)
  z-index 2
  &[hide]
    opacity 0
    pointer-events none
    transform scale(1.5)

#editorContents
  display flex
  justify-content space-around
  // Give those buttons some breathing room!
  max-height calc(100% - 50px)
  img
    object-fit contain
    &[selected]
      // Fixes layout when a picture is selected (ugh)
      height 50%
      margin auto 0

#fileSelector
  display flex
  justify-content space-evenly
  width 100%
  button
    border 2px solid rgba(255,255,255,.65)
    border-radius 8px
    padding 5px
    &:focus, &:hover
      background rgba(0,0,0,.65)
      &[disabled]
        background none
        color white
        cursor unset
    &[disabled]
      border none

#windowTitle
  margin-left 5px
</style>
