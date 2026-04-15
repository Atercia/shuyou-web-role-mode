<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

const hideNavRoutes = ['/plaza', '/fragment-interior', '/book-interior', '/plaza-element/museum', '/plaza-element/workshop', '/plaza-element/temple', '/plaza-element/market']

const showNav = computed(() => {
  if (hideNavRoutes.some(r => route.path.startsWith(r))) return false
  return true
})
</script>

<template>
  <header v-if="showNav">
    <div class="wrapper">
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/plaza">教育研学广场</RouterLink>
        <RouterLink to="/achievement">成就馆</RouterLink>
        <RouterLink to="/presale/one-center-four-platforms">售前板块</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
