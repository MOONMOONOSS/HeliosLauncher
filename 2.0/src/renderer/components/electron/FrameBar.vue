<template>
  <div id="frameBar">
    <div id="frameResizableTop" />
    <div id="frameMain">
      <div class="frameResizableVert" />
      <div
        v-if="platform === 'darwin'"
        id="frameContent"
        platform="darwin"
      >
        <div id="frameButtonDock">
          <button
            id="frameButton_close"
            class="frameButton"
            tabIndex="-1"
            @click="close"
          />
          <button
            id="frameButton_minimize"
            class="frameButton"
            tabIndex="-1"
            @click="minimize"
          />
          <button
            id="frameButton_restoredown"
            class="frameButton"
            tabIndex="-1"
            @click="restoreDown"
          />
        </div>
      </div>
      <div
        v-else
        id="frameContent"
        platform="win32"
      >
        <div id="frameTitleDock">
          <span id="frameTitleText">MOON2 Launcher</span>
        </div>
        <div id="frameButtonDock">
          <button
            id="frameButton_minimize"
            class="frameButton"
            tabIndex="-1"
            @click="minimize"
          >
            <svg
              name="titleBarMinimize"
              width="10"
              height="10"
              viewBox="0 0 12 12"
            >
              <rect
                stroke="#ffffff"
                fill="#ffffff"
                width="10"
                height="1"
                x="1"
                y="6"
              />
            </svg>
          </button>
          <button
            id="frameButton_restoredown"
            class="frameButton"
            tabIndex="-1"
            @click="restoreDown"
          >
            <svg
              name="titleBarMaximize"
              width="10"
              height="10"
              viewBox="0 0 12 12"
            >
              <rect
                width="9"
                height="9"
                x="1.5"
                y="1.5"
                fill="none"
                stroke="#ffffff"
                stroke-width="1.4px"
              />
            </svg>
          </button>
          <button
            id="frameButton_close"
            class="frameButton"
            tabIndex="-1"
            @click="close"
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
                points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583
                  1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
              />
            </svg>
          </button>
        </div>
      </div>
      <div class="frameResizableVert" />
    </div>
  </div>
</template>

<script>
import {remote} from 'electron'; // eslint-disable-line

export default {
  name: 'FrameBar',
  data: () => ({
    platform: process.platform,
    target: remote.getCurrentWindow(),
  }),
  methods: {
    close() {
      this.target.close();
    },
    minimize() {
      this.target.minimize();
      document.activeElement.blur();
    },
    restoreDown() {
      const { target } = this;

      if (target.isMaximized()) {
        target.unmaximize();
      } else {
        target.maximize();
      }

      document.activeElement.blur();
    },
  },
};
</script>

<style scoped lang="stylus">
.frameResizableVert
  width 2px
  -webkit-app-region no-drag

#frameBar
  display flex
  flex-direction column
  position fixed
  transition background-color 1s ease
  user-select none
  width -webkit-fill-available
  z-index 100

#frameButton_close
  &:active
    background rgba(235, 0, 0, .61) !important
  &:focus, &:hover
    background rgba(255, 53, 53, .61) !important

#frameButtonDock
  position relative
  -webkit-app-region no-drag !important

#frameContent
  display flex
  width 100%
  -webkit-app-region drag

#frameContent[platform='darwin']
  align-items center
  justify-content flex-start
  > #frameButtonDock
    right -1px
    top -1px
    > .frameButton
      border 0
      border-radius 50%
      cursor pointer
      height 12px
      margin-left 5px
      width 12px
      -webkit-app-region no-drag !important
    &:focus
      outline 0
    > #frameButton_close
      background-color #e74c32
      &:active
        background-color #ff8d7b
      &:focus, &:hover
        background-color #ff9a8a
    > #frameButton_minimize
      background-color #fed045
      &:active
        background-color #ffde7b
      &:focus, &:hover
        background-color #ffe9a9
    > #frameButton_restoredown
      background-color #96e734
      &:active
        background-color #bfff76
      &:focus, &:hover
        background-color #d6ffa6

#frameContent[platform='win32']
  justify-content space-between
  #frameButtonDock
    height 22px
    right -2px
    top -2px
    .frameButton
      background none
      border none
      cursor pointer
      height 22px
      width 39px
      &:active
        background rgba(156, 156, 156, .43)
      &:focus
        outline 0
      &:not(:first-child)
        margin-left -4px
      &:focus, &:hover
        background rgba(189, 189, 189, .43)

#frameMain
  display flex
  height 20px

#frameResizableTop
  height 2px
  width 100%
  -webkit-app-region no-drag

#frameTitleDock
  padding 0 10px

#frameTitleText
  font-family 'Avenir Medium'
  font-size 14px
  letter-spacing .5px
</style>
