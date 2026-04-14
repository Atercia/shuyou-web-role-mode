<script setup lang="ts">
</script>

<template>
  <main>
    <h1>2.5D 风格项目 Demo</h1>
    <p>这是一个基于 Vue3 + Three.js 的 2.5D 风格项目原型</p>
    <router-link to="/demo" class="demo-link">查看 Demo</router-link>
  </main>
</template>

<style scoped>
main {
  text-align: center;
  padding: 2rem;
}

h1 {
  color: #42b883;
  margin-bottom: 1rem;
}

.demo-link {
  display: inline-block;
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background-color: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.demo-link:hover {
  background-color: #369870;
}
</style>
