// Flashcards data management
let currentCardIndex = 0;
let wordList = [];

// Initialize flashcards
function initializeFlashcards() {
  // Load word list from localStorage or use default data
  const savedWords = localStorage.getItem('flashcardWords');
  if (savedWords) {
    wordList = JSON.parse(savedWords);
  } else {
    // Default word list with image and audio paths
    wordList = [
      {
        word: "apple",
        phonetic: "/ˈæp.əl/",
        meaning: "quả táo",
        example: "I eat an apple every day.",
        wordType: "noun",
        topic: "food",
        image: "FlashCards/assets/images/apple.jpg",
        audio: "FlashCards/assets/audio/apple.mp3"
      },
      {
        word: "book",
        phonetic: "/bʊk/",
        meaning: "sách",
        example: "I love reading books.",
        wordType: "noun",
        topic: "education",
        image: "FlashCards/assets/images/book.jpg",
        audio: "FlashCards/assets/audio/book.mp3"
      }
      // Add more words here
    ];
    localStorage.setItem('flashcardWords', JSON.stringify(wordList));
  }

  // Set up event listeners
  setupFlashcardEventListeners();
  
  // Update UI
  updateFlashcardUI();
}

// Set up event listeners for flashcards
function setupFlashcardEventListeners() {
  // Previous/Next buttons
  document.getElementById('prevCard').addEventListener('click', () => {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      updateFlashcardUI();
    }
  });

  document.getElementById('nextCard').addEventListener('click', () => {
    if (currentCardIndex < wordList.length - 1) {
      currentCardIndex++;
      updateFlashcardUI();
    }
  });

  // Flip card
  document.getElementById('flipCard').addEventListener('click', () => {
    const flashcard = document.querySelector('.flashcard');
    flashcard.classList.toggle('flipped');
  });

  // Pronounce word
  document.getElementById('volume').addEventListener('click', () => {
    const currentWord = wordList[currentCardIndex];
    playWordAudio(currentWord.audio);
  });

  // Mark as known
  document.getElementById('markAsKnown').addEventListener('click', () => {
    const currentWord = wordList[currentCardIndex];
    markWordAsKnown(currentWord.word);
  });

  // Mark for review
  document.getElementById('markForReview').addEventListener('click', () => {
    const currentWord = wordList[currentCardIndex];
    markWordForReview(currentWord.word);
  });

  // Topic filter
  document.getElementById('topicFlashcards').addEventListener('change', (e) => {
    filterFlashcardsByTopic(e.target.value);
  });

  // Auto play toggle
  document.getElementById('autoPlay').addEventListener('change', (e) => {
    localStorage.setItem('flashcardAutoPlay', e.target.checked);
  });

  // Auto flip toggle
  document.getElementById('autoFlip').addEventListener('change', (e) => {
    localStorage.setItem('flashcardAutoFlip', e.target.checked);
  });

  // Show image toggle
  document.getElementById('showImage').addEventListener('change', (e) => {
    const imageContainer = document.querySelector('.word-image');
    imageContainer.style.display = e.target.checked ? 'block' : 'none';
    localStorage.setItem('flashcardShowImage', e.target.checked);
  });
}

// Update flashcard UI
function updateFlashcardUI() {
  if (!wordList || wordList.length === 0) return;

  const currentWord = wordList[currentCardIndex];
  
  // Update word and phonetic
  document.querySelector('.word').textContent = currentWord.word;
  document.querySelector('.phonetic').textContent = currentWord.phonetic;
  
  // Update meaning and example
  document.querySelector('.meaning').textContent = currentWord.meaning;
  document.querySelector('.example').textContent = currentWord.example;
  
  // Update word type and category
  document.querySelector('.word-type span').textContent = currentWord.wordType;
  document.querySelector('.word-category span').textContent = currentWord.topic;
  
  // Update card counter
  document.getElementById('cardCounter').textContent = `${currentCardIndex + 1}/${wordList.length}`;
  
  // Update image
  updateWordImage(currentWord.image);
  
  // Reset card to front side
  const flashcard = document.querySelector('.flashcard');
  if (flashcard.classList.contains('flipped')) {
    flashcard.classList.remove('flipped');
  }
  
  // Auto play if enabled
  if (localStorage.getItem('flashcardAutoPlay') === 'true') {
    playWordAudio(currentWord.audio);
  }
}

// Update word image
function updateWordImage(imagePath) {
  const imageElement = document.querySelector('.word-image img');
  const imageContainer = document.querySelector('.word-image');
  const imagePlaceholder = document.querySelector('.image-placeholder');
  
  if (imageElement && imageContainer) {
    // Show placeholder during loading
    if (imagePlaceholder) {
      imagePlaceholder.style.display = 'flex';
    }
    
    imageElement.classList.add('loading');
    
    // Set image source
    imageElement.src = imagePath;
    
    // Handle image loading
    imageElement.onload = function() {
      imageElement.classList.remove('loading');
      if (imagePlaceholder) {
        imagePlaceholder.style.display = 'none';
      }
    };
    
    imageElement.onerror = function() {
      imageElement.classList.remove('loading');
      if (imagePlaceholder) {
        imagePlaceholder.style.display = 'none';
      }
      // Use a fallback image if loading fails
      imageElement.src = 'FlashCards/assets/images/placeholder.jpg';
    };
  }
}

// Play word audio
function playWordAudio(audioPath) {
  const audio = new Audio(audioPath);
  audio.play().catch(error => {
    console.error('Error playing audio:', error);
    // Fallback to Web Speech API if audio file fails
    const word = wordList[currentCardIndex].word;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  });
}

// Mark word as known
function markWordAsKnown(word) {
  const knownWords = JSON.parse(localStorage.getItem('knownWords') || '[]');
  if (!knownWords.includes(word)) {
    knownWords.push(word);
    localStorage.setItem('knownWords', JSON.stringify(knownWords));
    showToast('Đã đánh dấu từ này là đã biết', 'success');
  }
}

// Mark word for review
function markWordForReview(word) {
  const reviewWords = JSON.parse(localStorage.getItem('reviewWords') || '[]');
  if (!reviewWords.includes(word)) {
    reviewWords.push(word);
    localStorage.setItem('reviewWords', JSON.stringify(reviewWords));
    showToast('Đã thêm từ này vào danh sách ôn tập', 'info');
  }
}

// Filter flashcards by topic
function filterFlashcardsByTopic(topic) {
  if (!topic) return;
  
  const filteredWords = wordList.filter(word => word.topic === topic);
  if (filteredWords.length > 0) {
    wordList = filteredWords;
    currentCardIndex = 0;
    updateFlashcardUI();
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFlashcards);
} else {
  initializeFlashcards();
}

// Export functions for use elsewhere
window.initializeFlashcards = initializeFlashcards;
window.updateFlashcardUI = updateFlashcardUI;
window.filterFlashcardsByTopic = filterFlashcardsByTopic;