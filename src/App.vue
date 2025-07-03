<template>
  <div id="main">
    <h1>书本翻页效果演示</h1>
    
    <div class="mode-selector">
      <label>
        <input type="radio" v-model="flipMode" value="turnjs">
        TurnJS 实现
      </label>
      <label>
        <input type="radio" v-model="flipMode" value="stpageflip">
        StPageFlip 实现
      </label>
    </div>
    
    <TurnBookFlip v-if="flipMode === 'turnjs'" />
    <StPageFlipExample v-if="flipMode === 'stpageflip'" />
  </div>
</template>

<script>
import TurnBookFlip from './components/TurnBookFlip.vue'
import StPageFlipExample from './components/StPageFlipExample.vue'

export default {
  name: 'App',
  components: {
    TurnBookFlip,
    StPageFlipExample
  },
  data() {
    return {
      flipMode: 'turnjs'
    }
  }
}
</script>

<style>
#main {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}
html {
  width: 100%;
  height: 100%;
} 

body {
  width: 100%;
  height: 100%;
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
