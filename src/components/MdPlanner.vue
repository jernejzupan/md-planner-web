<template>
  <div class="plan-editor">
    <h2>Plan Input</h2>
    <textarea
      v-model="inputText"
      @input="updateOutput"
      rows="15"
      cols="60"
      spellcheck="false"
      placeholder="Paste your plan here..."
    ></textarea>

    <h2>Formatted Output</h2>
    <textarea
      :value="outputText"
      readonly
      rows="15"
      cols="60"
      spellcheck="false"
    ></textarea>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plan } from '@/lib/Plan.js'

const savedText = localStorage.getItem('inputText') ?? "";
const inputText = ref(savedText)
const outputText = ref('')

function updateOutput() {
  localStorage.setItem('inputText', inputText.value);
  try {
    const plan = Plan.from_str(inputText.value)
    plan.update()
    outputText.value = plan.get_str()
  } catch (err) {
    outputText.value = 'Error parsing plan: ' + err.message
  }
}
</script>

<style scoped>
.plan-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

textarea {
  font-family: monospace;
  width: 100%;
  box-sizing: border-box;
}
</style>
