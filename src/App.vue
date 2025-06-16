<template>
  <div id="app">
    <h1>Vue 书本翻页动画</h1>
    
    <div class="mode-selector">
      <label>
        <input type="radio" v-model="flipMode" value="custom" />
        自定义翻页效果
      </label>
      <label>
        <input type="radio" v-model="flipMode" value="turnjs" />
        Turn.js 翻页效果
      </label>
    </div>
    
    <BookFlip v-if="flipMode === 'custom'" />
    <TurnBookFlip v-if="flipMode === 'turnjs'" />
  </div>
</template>

<script>
import BookFlip from './components/BookFlip.vue'
import TurnBookFlip from './components/TurnBookFlip.vue'

export default {
  name: 'App',
  components: {
    BookFlip,
    TurnBookFlip
  },
  data() {
    return {
      flipMode: 'custom'
    }
  }
}
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

body {
  margin: 0;
  padding: 0;
  background-color: #e5e5e5;
  overflow-x: hidden;
}

h1 {
  margin-bottom: 20px;
  color: #42b983;
  font-size: 36px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.mode-selector {
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
}

.mode-selector label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 8px 15px;
  border-radius: 20px;
  background: #f0f0f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.mode-selector label:hover {
  background: #e0e0e0;
}

.mode-selector input[type="radio"] {
  margin-right: 5px;
}
</style>
