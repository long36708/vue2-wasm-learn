<script setup lang="ts">
// function foo() {
//   await 1;
//   foo();
// }
//
// foo();

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function init() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await delay(0);
  }
}
init();
</script>

<template>
  <div id="app">
    <header>
      <div class="wrapper">
        <nav>
          <router-link to="/">Home</router-link>
          <router-link to="/about">About</router-link>
        </nav>
      </div>
    </header>

    <router-view />
  </div>
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
