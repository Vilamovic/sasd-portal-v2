/**
 * Exam Utilities - Logika generowania egzaminów
 */

/**
 * Fisher-Yates Shuffle Algorithm
 * Shuffle array in-place (mutuje oryginalną tablicę)
 */
function shuffleArray(array) {
  const shuffled = [...array]; // Kopia aby nie mutować oryginału
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generuje egzamin z puli pytań
 * @param {Array} questionPool - Pełna pula pytań z bazy
 * @param {number} questionCount - Liczba pytań do wylosowania (default: 10)
 * @returns {Array} Wylosowane pytania z przemieszanymi odpowiedziami
 */
export function generateExam(questionPool, questionCount = 10) {
  if (!questionPool || questionPool.length === 0) {
    throw new Error('Question pool is empty');
  }

  // Losuj pytania z puli
  const shuffledPool = shuffleArray(questionPool);
  const selectedQuestions = shuffledPool.slice(0, Math.min(questionCount, questionPool.length));

  // Dla każdego pytania: przemieszaj odpowiedzi
  const examQuestions = selectedQuestions.map((question) => {
    // Stwórz tablicę opcji z indeksami (żeby zachować śledzenie poprawnych odpowiedzi)
    const optionsWithIndices = question.options.map((option, index) => ({
      text: option,
      originalIndex: index,
    }));

    // Przemieszaj opcje
    const shuffledOptions = shuffleArray(optionsWithIndices);

    // Mapuj poprawne odpowiedzi (indeksy) na nowe pozycje po shuffle
    let correctAnswers;

    if (question.is_multiple_choice) {
      // Multiple choice: tablica indeksów
      correctAnswers = question.correct_answers.map((correctIdx) => {
        // Znajdź nową pozycję oryginalnego indeksu
        return shuffledOptions.findIndex(opt => opt.originalIndex === correctIdx);
      }).filter(idx => idx !== -1); // Filtruj invalid indices
    } else {
      // Single choice: pojedynczy indeks (ale w tablicy dla spójności)
      const correctIdx = question.correct_answers[0];
      const newIndex = shuffledOptions.findIndex(opt => opt.originalIndex === correctIdx);
      correctAnswers = newIndex !== -1 ? [newIndex] : [];
    }

    return {
      id: question.id,
      exam_type_id: question.exam_type_id,
      question: question.question,
      shuffledOptions: shuffledOptions.map(opt => opt.text), // Zmieniono nazwę na shuffledOptions
      correct_answers: correctAnswers,
      is_multiple_choice: question.is_multiple_choice,
      time_limit: question.time_limit || 30, // Default 30s
    };
  });

  return examQuestions;
}

/**
 * Sprawdza poprawność odpowiedzi użytkownika
 * @param {Array|number} userAnswer - Odpowiedź użytkownika (tablica dla multi, number dla single)
 * @param {Array} correctAnswers - Poprawne odpowiedzi (zawsze tablica)
 * @param {boolean} isMultipleChoice - Czy to pytanie wielokrotnego wyboru
 * @returns {boolean} Czy odpowiedź jest poprawna
 */
export function checkAnswer(userAnswer, correctAnswers, isMultipleChoice) {
  if (userAnswer === -1 || userAnswer === null || userAnswer === undefined) {
    return false; // Timeout lub brak odpowiedzi
  }

  if (isMultipleChoice) {
    // Multiple choice: porównaj posortowane tablice
    if (!Array.isArray(userAnswer)) return false;

    const sortedUser = [...userAnswer].sort((a, b) => a - b);
    const sortedCorrect = [...correctAnswers].sort((a, b) => a - b);

    if (sortedUser.length !== sortedCorrect.length) return false;

    return sortedUser.every((val, idx) => val === sortedCorrect[idx]);
  } else {
    // Single choice: porównaj wartości
    return userAnswer === correctAnswers[0];
  }
}

/**
 * Oblicza wynik egzaminu
 * @param {Object} answers - Odpowiedzi użytkownika {questionId: answer}
 * @param {Array} examQuestions - Pytania egzaminacyjne
 * @returns {Object} { score, total, percentage, passed, details }
 */
export function calculateExamResult(answers, examQuestions) {
  let correctCount = 0;
  const total = examQuestions.length;

  const details = examQuestions.map((question) => {
    const userAnswer = answers[question.id];
    const isCorrect = checkAnswer(
      userAnswer,
      question.correct_answers,
      question.is_multiple_choice
    );

    if (isCorrect) correctCount++;

    return {
      questionId: question.id,
      question: question.question,
      userAnswer,
      correctAnswers: question.correct_answers,
      isCorrect,
      isTimeout: userAnswer === -1,
    };
  });

  const percentage = (correctCount / total) * 100;

  return {
    score: correctCount,
    total,
    percentage: Math.round(percentage * 100) / 100, // 2 miejsca po przecinku
    details,
  };
}

/**
 * Określa próg zdania egzaminu na podstawie typu
 * @param {string} examTypeName - Nazwa typu egzaminu (lowercase)
 * @returns {number} Procent wymagany do zdania (50 lub 75)
 */
export function getPassingThreshold(examTypeName) {
  const lowercaseName = examTypeName.toLowerCase();

  // 50% dla trainee, pościgowy, swat
  if (
    lowercaseName.includes('trainee') ||
    lowercaseName.includes('pościgowy') ||
    lowercaseName.includes('swat')
  ) {
    return 50;
  }

  // 75% dla reszty (gu, dtu, ss, advanced)
  return 75;
}

/**
 * Sprawdza czy egzamin został zdany
 * @param {number} percentage - Procent poprawnych odpowiedzi
 * @param {string} examTypeName - Nazwa typu egzaminu
 * @returns {boolean} Czy egzamin został zdany
 */
export function isPassed(percentage, examTypeName) {
  const threshold = getPassingThreshold(examTypeName);
  return percentage >= threshold;
}
