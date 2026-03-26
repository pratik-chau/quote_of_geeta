  // Bhagavad Gita: 18 chapters with max verse counts
  const CHAPTER_VERSES = [47,72,43,42,29,47,30,28,34,42,55,20,34,27,20,24,28,78];

  function getQuoteOfTheDay() {
    // Use today's date as seed for consistent daily verse
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const totalVerses = CHAPTER_VERSES.reduce((a, b) => a + b, 0);
    const verseIndex = dayOfYear % totalVerses;
    
    let count = 0;
    for (let chapter = 1; chapter <= 18; chapter++) {
      const maxVerse = CHAPTER_VERSES[chapter - 1];
      if (count + maxVerse > verseIndex) {
        const verse = (verseIndex - count) + 1;
        return { chapter, verse };
      }
      count += maxVerse;
    }
    return { chapter: 1, verse: 1 };
  }

  async function fetchVerse() {
    const card = document.getElementById('mainCard');
    const loader = document.getElementById('loader');
    const sanskritEl = document.getElementById('sanskrit');
    const translationEl = document.getElementById('translation');
    const referenceEl = document.getElementById('reference');
    const refTextEl = document.getElementById('refText');

    // Reset 
    card.classList.remove('loaded');
    loader.classList.remove('hidden');
    sanskritEl.textContent = '';
    translationEl.textContent = '';

    const { chapter, verse } = getQuoteOfTheDay();

    try {
      const url = `https://vedicscriptures.github.io/slok/${chapter}/${verse}/`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      // Extract fields
      const sanskrit = data.slok || '';
      // Try multiple translation sources
      const translation =
        data?.siva?.et ||
        data?.purohit?.et ||
        data?.gambir?.et ||
        data?.abhinav?.et ||
        data?.prabhu?.et ||
        'Translation not available for this verse.';

      //animation - wait for smooth loader fade
      await new Promise(r => setTimeout(r, 300));

      loader.classList.add('hidden');
      // Split Sanskrit verse at '|' character while keeping the pipe visible
      const sanskritWithBreak = sanskrit.includes('|') 
        ? sanskrit.replace('|', '|<br>').replace(/<br>\s+/g, '<br>')
        : sanskrit;
      sanskritEl.innerHTML = sanskritWithBreak;
      translationEl.textContent = translation;
      refTextEl.textContent = `Chapter ${chapter}, Verse ${verse}`;

      // Small delay to ensure DOM updates before applying loaded class
      await new Promise(r => setTimeout(r, 50));
      requestAnimationFrame(() => {
        card.classList.add('loaded');
      });

    } catch (err) {
      loader.classList.add('hidden');
      translationEl.innerHTML = `<span class="error-msg">Could not fetch verse. Please check your connection and try again.</span>`;
      refTextEl.textContent = `Chapter ${chapter}, Verse ${verse}`;
      card.classList.add('loaded');
      console.error(err);
    }
  }

  fetchVerse();