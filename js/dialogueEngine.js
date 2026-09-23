export class DialogueEngine {
  constructor() {
    this.dialogueBox = document.getElementById('dialogue-box');
    this.speakerName = document.getElementById('speaker-name');
    this.dialogueText = document.getElementById('dialogue-text');
    this.dialogueIndicator = document.getElementById('dialogue-indicator');
    this.narratorBox = document.getElementById('narrator-box');
    this.narratorText = document.getElementById('narrator-text');

    this.queue = [];
    this.currentIndex = 0;
    this.isTyping = false;
    this.typeTimer = null;
    this.charIndex = 0;
    this.currentFullText = '';
    this.onComplete = null;
    this.speed = 35;
    this.blocked = false;
  }

  loadDialogues(dialogues, onComplete) {
    this.queue = dialogues;
    this.currentIndex = 0;
    this.onComplete = onComplete;
    this.hideAll();
    this.showCurrent();
  }

  hideAll() {
    this.dialogueBox.classList.add('hidden');
    this.narratorBox.classList.add('hidden');
    this.dialogueIndicator.classList.remove('visible');
  }

  showCurrent() {
    if (this.currentIndex >= this.queue.length) {
      this.hideAll();
      if (this.onComplete) this.onComplete();
      return;
    }

    const entry = this.queue[this.currentIndex];

    if (entry.type === 'narrator') {
      this.dialogueBox.classList.add('hidden');
      this.narratorBox.classList.remove('hidden');
      this.typeText(this.narratorText, entry.text);
    } else {
      this.narratorBox.classList.add('hidden');
      this.dialogueBox.classList.remove('hidden');
      this.speakerName.textContent = entry.speaker;
      this.speakerName.setAttribute('data-speaker', entry.speaker);
      this.typeText(this.dialogueText, entry.text);
    }
  }

  typeText(element, text) {
    this.isTyping = true;
    this.charIndex = 0;
    this.currentFullText = text;
    this.dialogueIndicator.classList.remove('visible');
    element.textContent = '';

    clearInterval(this.typeTimer);
    this.typeTimer = setInterval(() => {
      if (this.charIndex < this.currentFullText.length) {
        element.textContent += this.currentFullText[this.charIndex];
        this.charIndex++;
      } else {
        clearInterval(this.typeTimer);
        this.isTyping = false;
        this.dialogueIndicator.classList.add('visible');
      }
    }, this.speed);
  }

  advance() {
    if (this.blocked) return;

    if (this.isTyping) {
      clearInterval(this.typeTimer);
      this.isTyping = false;
      const entry = this.queue[this.currentIndex];
      const target = entry.type === 'narrator' ? this.narratorText : this.dialogueText;
      target.textContent = this.currentFullText;
      this.dialogueIndicator.classList.add('visible');
      return;
    }

    this.currentIndex++;
    this.showCurrent();
  }

  block() {
    this.blocked = true;
  }

  unblock() {
    this.blocked = false;
  }

  clear() {
    clearInterval(this.typeTimer);
    this.hideAll();
    this.queue = [];
    this.currentIndex = 0;
  }
}
