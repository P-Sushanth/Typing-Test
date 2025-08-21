import React, { useState, useEffect, useRef, useCallback } from "react";
import {themes} from './themes.js';
import './App.css';
// --- WORD LISTS FOR DIFFICULTIES ---
const easyWords = [
  "react", "javascript", "monkey", "amazing", "pancake", "keyboard", "developer",
  "software", "function", "component", "style", "redux", "webpack", "babel",
  "terminal", "promise", "async", "await", "variable", "constant", "array",
  "object", "class", "interface", "module", "package", "script", "element"
];

const mediumWords = [
  "React", "JavaScript", "Monkey", "Amazing", "Pancake", "Keyboard", "Developer",
  "Software", "Function", "Component", "Style", "Redux", "WEBPACK", "BABEL",
  "Terminal", "Promise", "ASYNC", "AWAIT", "Variable", "Constant", "Array",
  "Object", "Class", "INTERFACE", "Module", "Package", "Script", "ELEMENT"
];

const hardWords = [
  "react-router-dom", "asynchronous-javascript", "event-driven", "state-management",
  "object-oriented", "front-end", "back-end", "full-stack", "component-based",
  "API-endpoint", "JSON.stringify()", "localStorage.getItem('user')",
  "a,b,c-d,e,f.", "Error: 404.", "console.log('Hello, World!');"
];

const difficultyLevels = {
  easy: easyWords,
  medium: mediumWords,
  hard: hardWords,
};

// --- LIST OF QUOTES ---
const quotesList = [
  "Winter is coming.",
  "Kill the boy, and let the man be born.",
  "Look how they massacred my boy.",
  "Get busy living or get busy dying.",
  "Which would be worse: to live as a monster, or die as a good man?",
  "I am Ironman.",
  "Only I can call my dreams stupid.",
  "The One Piece is real!",
  "As long as I'm still alive, I have infinite chances.",
  "Chaos is a ladder.",
  "You know nothing, Jon Snow.",
  "Valar Morghulis.",
  "Leave one wolf alive and the sheep are never safe.",
  "Dracarys",
  "Hold the door!",
  "Stay out of my territory.",
  "I am the one who knocks.",
  "I did it for me",
  "Say My Name.",
  "I'm the king of the world!",
  "Say hello to my little friend!",
  "Carpe diem.",
  "Here's Johnny!",
  "Why so serious?",
  "May the Force be with you.",
  "Oh captain my captain."
];

const INITIAL_WORD_COUNT = 60;
const WORDS_TO_ADD = 30;

function App() {
  const [words, setWords] = useState([]);
  const [timeLimit, setTimeLimit] = useState(60);
  const [difficulty, setDifficulty] = useState('easy');
  const [mode, setMode] = useState('words'); // 'words' or 'quotes'
  const [timeLeft, setTimeLeft] = useState(60);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [input, setInput] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordStatuses, setWordStatuses] = useState([]);

  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [extraChars, setExtraChars] = useState(0);
  const [missedChars, setMissedChars] = useState(0);
  
  const [wordTimestamps, setWordTimestamps] = useState([]);
  const [testStartTime, setTestStartTime] = useState(0);

  const [theme, setTheme] = useState(themes.catppuccin);

  const caretRef = useRef(null);
  const currentWordRef = useRef(null);
  const wordsContainerRef = useRef(null);

  const addMoreWords = useCallback(() => {
    const currentWordList = difficultyLevels[difficulty];
    const newWords = Array.from({ length: WORDS_TO_ADD }, () =>
      currentWordList[Math.floor(Math.random() * currentWordList.length)]
    );
    setWords(prev => [...prev, ...newWords]);
    setWordStatuses(prev => [...prev, ...Array(WORDS_TO_ADD).fill('untyped')]);
  }, [difficulty]);

  // === NEW: Function to add the next quote in the loop ===
  const addNewQuote = useCallback(() => {
    const randomQuote = quotesList[Math.floor(Math.random() * quotesList.length)];
    const quoteWords = randomQuote.split(' ');
    setWords(prev => [...prev, ...quoteWords]);
    setWordStatuses(prev => [...prev, ...Array(quoteWords.length).fill('untyped')]);
  }, []);

  const moveToNextWord = useCallback((currentInput) => {
    // Add more content if user is near the end, depending on the mode
    if (mode === 'words' && currentWordIndex > words.length - 25) {
      addMoreWords();
    } else if (mode === 'quotes' && currentWordIndex === words.length - 1) {
      addNewQuote(); // When the last word of a quote is finished, add the next quote
    }

    const currentWord = words[currentWordIndex];
    const typedWord = currentInput.trim();
    let correct = 0, incorrect = 0, extra = 0;
    for (let i = 0; i < typedWord.length; i++) {
      if (i < currentWord.length) {
        if (typedWord[i] === currentWord[i]) correct++;
        else incorrect++;
      } else {
        extra++;
      }
    }
    const missed = Math.max(0, currentWord.length - typedWord.length);
    setCorrectChars(p => p + correct);
    setIncorrectChars(p => p + incorrect);
    setExtraChars(p => p + extra);
    setMissedChars(p => p + missed);
    
    const isCorrect = typedWord === currentWord;
    if (isCorrect) {
      const startTime = wordTimestamps.length > 0 ? wordTimestamps[wordTimestamps.length - 1].time : testStartTime;
      const endTime = Date.now();
      const durationMinutes = (endTime - startTime) / 60000;
      if (durationMinutes > 0) {
        const wpm = (currentWord.length / 5) / durationMinutes;
        setWordTimestamps(prev => [...prev, { wpm, time: endTime }]);
      }
    }

    setWordStatuses(prev => {
      const newStatuses = [...prev];
      newStatuses[currentWordIndex] = isCorrect ? 'correct' : 'incorrect';
      return newStatuses;
    });
    
    setCurrentWordIndex(prev => prev + 1);
    setInput("");
  }, [addMoreWords, addNewQuote, currentWordIndex, testStartTime, wordTimestamps, words, mode]);

  const generateWords = useCallback(() => {
    let initialWords;
    if (mode === 'quotes') {
      const randomQuote = quotesList[Math.floor(Math.random() * quotesList.length)];
      initialWords = randomQuote.split(' ');
    } else {
      const currentWordList = difficultyLevels[difficulty];
      initialWords = Array.from({ length: INITIAL_WORD_COUNT }, () =>
        currentWordList[Math.floor(Math.random() * currentWordList.length)]
      );
    }
    setWords(initialWords);
    setWordStatuses(Array(initialWords.length).fill('untyped'));

    // Reset all stats
    setCurrentWordIndex(0);
    setInput("");
    setIsStarted(false);
    setIsFinished(false);
    setTimeLeft(timeLimit);
    setCorrectChars(0);
    setIncorrectChars(0);
    setExtraChars(0);
    setMissedChars(0);
    setWordTimestamps([]);
    setTestStartTime(0);
    if (wordsContainerRef.current) wordsContainerRef.current.scrollTop = 0;
  }, [timeLimit, difficulty, mode]);

  const handleTimeChange = (time) => { setTimeLimit(time); };
  const handleDifficultyChange = (level) => { setDifficulty(level); };
  const handleModeChange = (newMode) => { setMode(newMode); };

  useEffect(() => {
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [theme]);

  useEffect(() => { generateWords(); }, [timeLimit, difficulty, mode]);

  useEffect(() => {
    let timer;
    if (isStarted && timeLeft > 0 && !isFinished) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isStarted) {
      setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, isFinished]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') { e.preventDefault(); generateWords(); return; }
      if (isFinished) return;
      if (!isStarted) {
        setIsStarted(true);
        setTestStartTime(Date.now());
      }
      if (e.key === ' ') {
        e.preventDefault();
        if (input.trim().length > 0) {
          moveToNextWord(input);
        }
      } else if (e.key === 'Backspace') {
        setInput(prev => prev.slice(0, -1));
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setInput(prev => prev + e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, isFinished, generateWords, moveToNextWord, input]);
  
  useEffect(() => {
    const activeWordEl = currentWordRef.current;
    const containerEl = wordsContainerRef.current;
    if (activeWordEl && containerEl) {
      const desiredScrollTop = activeWordEl.offsetTop - (containerEl.clientHeight / 2) + (activeWordEl.clientHeight / 2);
      containerEl.scrollTo({ top: desiredScrollTop, behavior: 'smooth' });
    }
  }, [currentWordIndex]);

  useEffect(() => {
    if (isFinished || !caretRef.current || !currentWordRef.current) return;
    const updateCaretPosition = () => {
      const activeWordEl = currentWordRef.current;
      let left = activeWordEl.offsetLeft;
      let top = activeWordEl.offsetTop;
      const currentWord = words[currentWordIndex];
      if (currentWord) {
        const typedChars = input.length;
        if (typedChars < currentWord.length) {
          const nextCharEl = activeWordEl.children[typedChars];
          if (nextCharEl) {
            left = nextCharEl.offsetLeft;
            top = nextCharEl.offsetTop;
          }
        } else {
          const lastCharEl = activeWordEl.children[currentWord.length - 1];
          if (lastCharEl) {
            left = lastCharEl.offsetLeft + lastCharEl.offsetWidth;
            top = lastCharEl.offsetTop;
          }
        }
      }
      caretRef.current.style.left = `${left}px`;
      caretRef.current.style.top = `${top}px`;
    };
    requestAnimationFrame(updateCaretPosition);
  }, [input, currentWordIndex, isFinished, words]);
  
  const calculateWPM = () => {
    const minutes = (timeLimit - timeLeft) / 60;
    return minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
  };
  const calculateAccuracy = () => {
    const totalTyped = correctChars + incorrectChars;
    return totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;
  };
  const calculateConsistency = () => {
    if (wordTimestamps.length < 2) return 100;
    const wpmValues = wordTimestamps.map(t => t.wpm);
    const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
    if (mean === 0) return 0;
    const stdDev = Math.sqrt(wpmValues.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / wpmValues.length);
    return Math.round(Math.max(0, (1 - stdDev / mean) * 100));
  };
  const renderCurrentWord = () => {
    const currentWord = words[currentWordIndex];
    if (!currentWord) return null;
    const typedChars = input.split('');
    const wordChars = currentWord.split('');
    return (
      <>
        {typedChars.map((char, index) => {
          let className;
          if (index < wordChars.length) {
            className = char === wordChars[index] ? 'correct' : 'incorrect';
          } else {
            className = 'extra';
          }
          return <span key={`typed-${index}`} className={className}>{char}</span>;
        })}
        {wordChars.slice(typedChars.length).map((char, index) => (
          <span key={`untyped-${index}`}>{char}</span>
        ))}
      </>
    );
  };

  return (
    <div className="container">
      <h1>Typing Test</h1>
      {!isFinished ? (
        <>
          <div className="config-panel">
            {/* ADD THIS ENTIRE BLOCK  */}
            <div className="theme-buttons">
              <span className="config-label">Theme:</span>
                {Object.values(themes).map(themeItem => (
                <button 
                  key={themeItem.name} 
                  onClick={() => setTheme(themeItem)}
                  className={theme.name === themeItem.name ? 'active' : ''}
                  disabled={isStarted}
                >{themeItem.name}</button>
              ))}
            </div>
            <div className="mode-buttons">
              <span className="config-label">Mode:</span>
              {['words', 'quotes'].map(m => (
                <button 
                  key={m} 
                  onClick={() => handleModeChange(m)} 
                  className={mode === m ? 'active' : ''}
                  disabled={isStarted}
                >{m}</button>
              ))}
            </div>

            <div className="timer-buttons">
              <span className="config-label">Time:</span>
              {[15, 30, 60, 120].map(t => (
                <button 
                  key={t} 
                  onClick={() => handleTimeChange(t)} 
                  className={timeLimit === t ? 'active' : ''}
                  disabled={isStarted}
                >{t}s</button>
              ))}
            </div>
            
            {mode === 'words' && (
              <div className="difficulty-buttons">
                <span className="config-label">Difficulty:</span>
                {['easy', 'medium', 'hard'].map(level => (
                  <button 
                    key={level} 
                    onClick={() => handleDifficultyChange(level)} 
                    className={difficulty === level ? 'active' : ''}
                    disabled={isStarted}
                  >{level}</button>
                ))}
              </div>
            )}
          </div>

          <p className="timer">{timeLeft}s</p>
          <div ref={wordsContainerRef} className={`words ${mode === 'quotes' ? 'quotes-mode' : ''}`}>
            <span ref={caretRef} className="caret"></span>
            {words.map((word, index) => (
              <span 
                key={index} 
                ref={index === currentWordIndex ? currentWordRef : null}
                className={`word ${index === currentWordIndex ? 'current' : ''} ${wordStatuses[index]}`}
              >
                {index === currentWordIndex ? renderCurrentWord() : word}
              </span>
            ))}
          </div>
          <p className="hint">Press <kbd>Tab</kbd> to restart.</p>
        </>
      ) : (
        <div className="results">
          <h2>Results</h2>
          <div className="results-grid">
            <p><strong>WPM:</strong> {calculateWPM()}</p>
            <p><strong>Accuracy:</strong> {calculateAccuracy()}%</p>
            <p><strong>Consistency:</strong> {calculateConsistency()}%</p>
            <div className="char-stats tooltip-container">
              <p>
                <strong>Characters:</strong>{' '}
                <span className="correct">{correctChars}</span>/
                <span className="incorrect">{incorrectChars}</span>/
                <span className="missed">{missedChars}</span>/
                <span className="extra">{extraChars}</span>
              </p>
              <span className="tooltip-text">
                correct / incorrect / missed / extra
              </span>
            </div>
          </div>
          <button className="restart" onClick={generateWords}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default App;