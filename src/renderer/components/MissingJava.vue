<template>
  <main>
    <header class="underlined">
      Install OpenJRE 8
    </header>
    <summary>
      MOON2 Launcher was unable to detect a compatible version of Java for use.
      In order to launch Minecraft MOON2 Launcher would like to download and use
      OpenJRE 8, a free to use alterative to Oracle JRE 8.
    </summary>
  </main>
</template>

<script>
export default {
  name: 'MissingJava',
};
</script>

<style scoped lang="stylus">
header
  font-size 64px
  margin-bottom 1rem
  text-align center
  width 16ch

main
  align-items center
  display flex
  flex-direction column
  height calc(100vh - 22px)
  justify-content center
  padding-top 22px
  width 100vw

summary
  font-size 20px
  max-width 80vw
  text-align center
  width 65ch

.underlined
  border-bottom white 1px solid
</style>
