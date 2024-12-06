<template>
  <img alt="Vue logo" style="height:40px;" src="./assets/logo.png"> BookLesson
  <LessonList msg="Welcome to Your Vue.js App"/>
</template>

<script>
import LessonList from './components/LessonList.vue'

export default {
  name: 'App',
  components: {
    LessonList
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
