<script setup lang="ts">
</script>

<template>
  <main>
    <h1>2.5D 风格项目 Demo</h1>
    <p>这是一个基于 Vue3 + Three.js 的 2.5D 风格项目原型</p>
    <div class="links">
      <router-link to="/demo" class="demo-link">查看 Demo</router-link>
      <router-link to="/plaza" class="plaza-link">🏛️ 广场探索</router-link>
    </div>
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

.links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.demo-link, .plaza-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.demo-link {
  background-color: #42b883;
  color: white;
}

.demo-link:hover {
  background-color: #369870;
}

.plaza-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.plaza-link:hover {
  opacity: 0.9;
}
</style>
