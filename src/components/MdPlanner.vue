<template>
  <div class="plan-editor">
    <h2>Plan Input</h2>
    <div style="display: flex;  gap: 8px;">
    <button @click="swapLineButton('down')">▼</button>
    <button @click="swapLineButton('up')">▲</button>
    <button @click="adjustIndentationButton('out')">◀</button>
    <button @click="adjustIndentationButton('in')">▶</button>
    <button @click="adjustNumberNearCursorButton(1)">+</button>
    <button @click="adjustNumberNearCursorButton(-1)">-</button>
    </div>
    <textarea
      ref="textarea"
      v-model="inputText"
      @input="updateOutput"
      @keydown="keyDown"
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
const textarea = ref(null);
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

function swapLineButton(direction) {
  performSwap(textarea.value, direction);

  // Restore focus to textarea
  setTimeout(() => {
    textarea.value?.focus();
  }, 0);
}

function adjustIndentationButton(direction) {
  adjustIndentation(textarea.value, direction);

  // Restore focus to textarea
  setTimeout(() => {
    textarea.value?.focus();
  }, 0);
}

function adjustNumberNearCursorButton(n) {
  adjustNumberNearCursor(textarea.value, n);

  // Restore focus to textarea
  setTimeout(() => {
    textarea.value?.focus();
  }, 0);
}

function keyDown(event) {
  if (event.altKey && event.key === 'ArrowLeft') {
    adjustIndentation(textarea.value, "out");
    updateOutput();
    event.preventDefault();
  }
  else if (event.altKey && event.key === 'ArrowRight') {
    adjustIndentation(textarea.value, "in");
    updateOutput();
    event.preventDefault();
  }
  else if (event.ctrlKey && event.altKey && event.key === 'ArrowUp') {
    adjustNumberNearCursor(textarea.value, 10);
    updateOutput();
    event.preventDefault();
  }
  else if (event.ctrlKey && event.altKey && event.key === 'ArrowDown') {
    adjustNumberNearCursor(textarea.value, -10);
    updateOutput();
    event.preventDefault();
  }
  else if (event.altKey && event.key === 'ArrowUp') {
    performSwap(textarea.value, "up");
    updateOutput();
    event.preventDefault();
  }
  else if (event.altKey && event.key === 'ArrowDown') {
    performSwap(textarea.value, "down");
    updateOutput();
    event.preventDefault();
  }
  else if (event.ctrlKey && event.key === 'ArrowUp') {
    adjustNumberNearCursor(textarea.value, 1);
    updateOutput();
    event.preventDefault();
  }
  else if (event.ctrlKey && event.key === 'ArrowDown') {
    adjustNumberNearCursor(textarea.value, -1);
    updateOutput();
    event.preventDefault();
  }
  else if (event.key === 'Enter') {
    newLine(textarea.value);
    updateOutput();
    event.preventDefault();
  }
}

function performSwap(textarea, direction) {
  const cursorPos = textarea.selectionStart;
  const lines = inputText.value.split('\n');

  // Find current line index and offset within the line
  let charCount = 0;
  let currentLineIndex = 0;
  let offsetInLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1;
    if (charCount + lineLength > cursorPos) {
      currentLineIndex = i;
      offsetInLine = cursorPos - charCount;
      break;
    }
    charCount += lineLength;
  }

  const swapWithIndex = direction === 'down'
    ? currentLineIndex + 1
    : currentLineIndex - 1;

  if (swapWithIndex < 0 || swapWithIndex >= lines.length) return;

  // Swap lines
  [lines[currentLineIndex], lines[swapWithIndex]] =
    [lines[swapWithIndex], lines[currentLineIndex]];

  inputText.value = lines.join('\n');

  // Calculate new cursor position
  const newCharCount = lines
    .slice(0, swapWithIndex)
    .reduce((acc, line) => acc + line.length + 1, 0);

  const newCursorPos = newCharCount + Math.min(offsetInLine, lines[swapWithIndex].length);

  // Restore cursor after DOM update
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = newCursorPos;
  }, 0);
}

function adjustIndentation(textarea, direction) {
  const cursorPos = textarea.selectionStart;
  const lines = inputText.value.split('\n');

  // Find current line index
  let charCount = 0;
  let currentLineIndex = 0;
  let offsetInLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1;
    if (charCount + lineLength > cursorPos) {
      currentLineIndex = i;
      offsetInLine = cursorPos - charCount;
      break;
    }
    charCount += lineLength;
  }

  // Modify indentation
  const line = lines[currentLineIndex];
  if (direction === 'in') {
    lines[currentLineIndex] = '  ' + line; // add two spaces
    offsetInLine += 2;
  } else if (direction === 'out') {
    const match = line.match(/^([ \t]+)/);
    if (match) {
      const indent = match[0];
      const reduced = indent.length >= 2 ? indent.slice(2) : '';
      lines[currentLineIndex] = reduced + line.slice(indent.length);
      offsetInLine = Math.max(0, offsetInLine - (indent.length - reduced.length));
    }
  }

  // Update textarea
  inputText.value = lines.join('\n');

  // Restore cursor position
  setTimeout(() => {
    const newCharCount = lines
      .slice(0, currentLineIndex)
      .reduce((acc, line) => acc + line.length + 1, 0);

    textarea.selectionStart = textarea.selectionEnd = newCharCount + offsetInLine;
  }, 0);
}

function newLine(textarea) {
  // Prevent default Enter behavior

  const cursorPos = textarea.selectionStart;
  const value = textarea.value;

  // Find start of current line
  const lineStart = value.lastIndexOf('\n', cursorPos - 1) + 1;
  const line = value.slice(lineStart, cursorPos);

  // Match leading whitespace (spaces or tabs)
  const indentMatch = line.match(/^[ \t]*/);
  const indentation = indentMatch ? indentMatch[0] : '';

  // Insert newline + indentation
  const before = value.slice(0, cursorPos);
  const after = value.slice(cursorPos);
  const newValue = before + '\n' + indentation + after;

  // Update value and cursor position
  textarea.value = newValue;
  textarea.selectionStart = textarea.selectionEnd = cursorPos + 1 + indentation.length;

}

function adjustNumberNearCursor(textarea, n) {
  const value = textarea.value;
  const cursorPos = textarea.selectionStart;

  // Regex to find number near cursor
  const numberRegex = /\d+/g;
  let match;
  let targetStart = -1;
  let targetEnd = -1;

  while ((match = numberRegex.exec(value)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    if (cursorPos >= start - 1 && cursorPos <= end + 1) {
      targetStart = start;
      targetEnd = end;
      break;
    }
  }

  if (targetStart === -1) return; // no number found near cursor

  const originalNumber = parseInt(value.slice(targetStart, targetEnd), 10);
  const newNumber = Math.max(0, originalNumber + n);

  const newValue =
    value.slice(0, targetStart) +
    newNumber +
    value.slice(targetEnd);

  inputText.value = newValue;

  // Restore cursor position after update
  const offset = newNumber.toString().length - originalNumber.toString().length;
  const newCursorPos = cursorPos + offset;

  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = newCursorPos;
  }, 0);
}


updateOutput();
</script>

<style scoped>
.plan-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

textarea {
  font-family: monospace;
  font-size: 1.2rem;
  width: 100%;
  box-sizing: border-box;
}

button {
  font-size: 2rem;
  color: white;
  background-color: black;
  border-width: 0;
  border-radius: 4px;
  width: 2.8rem;
}
</style>
