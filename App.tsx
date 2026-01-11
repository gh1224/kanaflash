import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { HIRAGANA, KATAKANA } from './constants';
import { KanaItem, View, KanaType, KanaCategory } from './types';
import { Button } from './components/Button';
import { DrawingCanvas } from './components/DrawingCanvas';

const App: React.FC = () => {
  // --- State ---
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [selectedTypes, setSelectedTypes] = useState<KanaType[]>(['hiragana']);
  const [selectedCategories, setSelectedCategories] = useState<KanaCategory[]>(['basic']);
  
  const [quizDeck, setQuizDeck] = useState<KanaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Modals
  const [writingPickerOpen, setWritingPickerOpen] = useState(false);
  const [quizPickerOpen, setQuizPickerOpen] = useState(false);
  const [tempSelectedQuizIds, setTempSelectedQuizIds] = useState<string[]>([]);
  
  // Timer
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [initialTime, setInitialTime] = useState<number>(0);
  const [sessionTimeTaken, setSessionTimeTaken] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // Session Stats
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  const [mistakes, setMistakes] = useState<string[]>(() => {
    const saved = localStorage.getItem('kana_mistakes');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // --- Browser Navigation Support ---
  const navigateTo = useCallback((view: View) => {
    window.history.pushState({ view }, '');
    setCurrentView(view);
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      } else {
        setCurrentView(View.HOME);
      }
      // Close all modals on back button
      setWritingPickerOpen(false);
      setQuizPickerOpen(false);
    };

    window.addEventListener('popstate', handlePopState);
    
    if (!window.history.state) {
      window.history.replaceState({ view: View.HOME }, '');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('kana_mistakes', JSON.stringify(mistakes));
  }, [mistakes]);

  const endQuizSession = useCallback((timeTakenOverride?: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeTakenOverride !== undefined) {
      setSessionTimeTaken(timeTakenOverride);
    }
    navigateTo(View.SUMMARY);
    setTimeLeft(null);
  }, [navigateTo]);

  // --- Timer logic ---
  useEffect(() => {
    if (currentView === View.QUIZ && timeLeft !== null) {
      if (timeLeft > 0) {
        timerRef.current = window.setInterval(() => {
          setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
        }, 1000);
      } else {
        endQuizSession(initialTime);
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentView, timeLeft === 0, endQuizSession, initialTime]);

  // --- Derived Data ---
  const allKana = useMemo(() => [...HIRAGANA, ...KATAKANA], []);
  const mistakeItems = useMemo(() => 
    allKana.filter(k => mistakes.includes(k.id)),
    [allKana, mistakes]
  );
  const activePool = useMemo(() => 
    allKana.filter(k => selectedTypes.includes(k.type) && selectedCategories.includes(k.category)),
    [allKana, selectedTypes, selectedCategories]
  );

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}초`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs === 0 ? `${mins}분` : `${mins}분 ${secs}초`;
  };

  // --- Actions ---
  const startQuiz = useCallback((deck: KanaItem[]) => {
    if (deck.length === 0) return;
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setQuizDeck(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionStats({ correct: 0, incorrect: 0 });
    setSessionTimeTaken(0);
    const duration = Math.max(10, deck.length * 4);
    setTimeLeft(duration);
    setInitialTime(duration);
    setQuizPickerOpen(false);
    navigateTo(View.QUIZ);
  }, [navigateTo]);

  const startWriting = useCallback((deck: KanaItem[], startIndex: number = 0) => {
    if (deck.length === 0) return;
    setQuizDeck(deck);
    setCurrentIndex(startIndex);
    setWritingPickerOpen(false);
    if (currentView !== View.WRITING) {
      navigateTo(View.WRITING);
    }
  }, [navigateTo, currentView]);

  const handleNext = (isCorrect: boolean) => {
    const currentItem = quizDeck[currentIndex];
    if (isCorrect) {
      setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      setMistakes(prev => prev.filter(id => id !== currentItem.id));
    } else {
      setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      if (!mistakes.includes(currentItem.id)) {
        setMistakes(prev => [...prev, currentItem.id]);
      }
    }

    if (currentIndex < quizDeck.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      const timeTaken = initialTime - (timeLeft || 0);
      endQuizSession(timeTaken);
    }
  };

  const toggleQuizItem = (id: string) => {
    setTempSelectedQuizIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // --- Sub-renderers ---
  const renderHome = () => (
    <div className="flex flex-col gap-6 p-6 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="text-center mt-8 mb-4">
        <h1 className="text-4xl font-extrabold text-indigo-900 tracking-tight font-kana">KanaFlash</h1>
        <p className="text-slate-500 mt-2 font-medium">일본어 가나를 누구보다 빠르게!</p>
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-800">문자 선택</h2>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setSelectedTypes(prev => prev.includes('hiragana') ? prev.filter(t => t !== 'hiragana') : [...prev, 'hiragana'])}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${selectedTypes.includes('hiragana') ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-inner' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
          >
            <span className="text-3xl block mb-1 font-kana">あ</span>
            <span className="text-sm font-bold">Hiragana</span>
          </button>
          <button 
            onClick={() => setSelectedTypes(prev => prev.includes('katakana') ? prev.filter(t => t !== 'katakana') : [...prev, 'katakana'])}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${selectedTypes.includes('katakana') ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-inner' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
          >
            <span className="text-3xl block mb-1 font-kana">ア</span>
            <span className="text-sm font-bold">Katakana</span>
          </button>
        </div>

        <h3 className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-wider px-1">포함할 종류</h3>
        <div className="flex flex-wrap gap-2">
          {(['basic', 'dakuten', 'youm'] as KanaCategory[]).map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
              className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${selectedCategories.includes(cat) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}
            >
              {cat === 'basic' ? '기본음' : cat === 'dakuten' ? '탁음' : '요음'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Button disabled={activePool.length === 0} onClick={() => {
            setTempSelectedQuizIds(activePool.map(k => k.id));
            setQuizPickerOpen(true);
          }}>플래시카드 시작</Button>
          <Button variant="secondary" disabled={activePool.length === 0} onClick={() => setWritingPickerOpen(true)}>쓰기 연습</Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">복습</h2>
          <span className="text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded-full font-bold">{mistakes.length}개 남음</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 text-sm py-2" onClick={() => navigateTo(View.REVIEW)} disabled={mistakes.length === 0}>목록 보기</Button>
          <Button variant="danger" className="flex-1 text-sm py-2" onClick={() => startQuiz(mistakeItems)} disabled={mistakes.length === 0}>복습 시작</Button>
        </div>
      </div>
    </div>
  );

  const renderQuizPicker = () => {
    if (!quizPickerOpen) return null;
    const selectedCount = tempSelectedQuizIds.length;
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800 px-1">학습 범위 선택</h3>
              <p className="text-xs text-slate-400 px-1 mt-0.5">원하는 글자를 눌러서 선택하세요</p>
            </div>
            <button onClick={() => setQuizPickerOpen(false)} className="text-slate-400 p-2 active:scale-90 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex gap-2 mb-4">
            <button onClick={() => setTempSelectedQuizIds(activePool.map(k => k.id))} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">전체 선택</button>
            <button onClick={() => setTempSelectedQuizIds([])} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">전체 해제</button>
          </div>

          <div className="overflow-y-auto flex-1 grid grid-cols-5 gap-2 pr-1 scrollbar-hide">
            {activePool.map((k) => {
              const isSelected = tempSelectedQuizIds.includes(k.id);
              return (
                <button 
                  key={k.id} 
                  onClick={() => toggleQuizItem(k.id)} 
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all border active:scale-95 ${isSelected ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-200' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-indigo-50 hover:text-indigo-600'}`}
                >
                  <span className="text-xl font-bold font-kana leading-none">{k.char}</span>
                  <span className={`text-[10px] uppercase font-black mt-1 ${isSelected ? 'opacity-80' : 'opacity-50'}`}>{k.romaji}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Button disabled={activePool.length === 0} onClick={() => startQuiz(activePool)} variant="outline">전체 글자 퀴즈 시작</Button>
            <Button disabled={selectedCount === 0} onClick={() => startQuiz(activePool.filter(k => tempSelectedQuizIds.includes(k.id)))}>
              {selectedCount}개 글자만 학습 시작
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderWritingPicker = () => {
    if (!writingPickerOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-800 px-1">시작할 글자 선택</h3>
            <button onClick={() => setWritingPickerOpen(false)} className="text-slate-400 p-2 active:scale-90 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="overflow-y-auto flex-1 grid grid-cols-5 gap-2 pr-1 scrollbar-hide">
            <button onClick={() => startWriting(activePool, 0)} className="col-span-5 bg-indigo-50 text-indigo-700 py-3 rounded-xl font-bold mb-2 border-2 border-indigo-100 text-sm active:scale-[0.98] transition-transform">처음부터 순서대로 시작</button>
            {activePool.map((k, idx) => (
              <button 
                key={k.id} 
                onClick={() => startWriting(activePool, idx)} 
                className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all border active:scale-95 ${currentIndex === idx && currentView === View.WRITING ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-indigo-50 hover:text-indigo-600'}`}
              >
                <span className="text-xl font-bold font-kana leading-none">{k.char}</span>
                <span className={`text-[10px] uppercase font-black mt-1 ${currentIndex === idx && currentView === View.WRITING ? 'opacity-80' : 'opacity-50'}`}>{k.romaji}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    const item = quizDeck[currentIndex];
    const timeProgress = timeLeft !== null ? (timeLeft / initialTime) * 100 : 100;
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 overflow-hidden">
        <div className="w-full bg-slate-200 h-1.5 overflow-hidden">
          <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft && timeLeft < 10 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${timeProgress}%` }} />
        </div>
        <div className="p-4 flex items-center justify-between">
          <button onClick={() => { window.history.back(); setTimeLeft(null); }} className="text-slate-400 p-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          <span className={`text-sm font-black ${timeLeft && timeLeft < 10 ? 'text-rose-600 animate-pulse' : 'text-slate-600'}`}>{timeLeft}초 남음</span>
          <span className="text-xs font-bold text-slate-400">{currentIndex + 1}/{quizDeck.length}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <div className={`relative w-full max-w-[260px] aspect-[3/4] bg-white rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center border-4 transition-all duration-300 ${showAnswer ? 'border-indigo-100' : 'border-transparent'}`}>
            <span className="text-[8rem] font-bold text-indigo-950 font-kana">{item.char}</span>
            {showAnswer && <span className="text-4xl font-black text-indigo-600 uppercase tracking-widest mt-4 animate-in zoom-in">{item.romaji}</span>}
          </div>
        </div>
        <div className="p-8 pb-8 bg-white rounded-t-[3rem] shadow-2xl">
          {!showAnswer ? <Button onClick={() => setShowAnswer(true)} className="w-full py-5 text-xl">정답 확인</Button> : (
            <div className="grid grid-cols-2 gap-4">
              <Button variant="danger" onClick={() => handleNext(false)} className="py-5">몰라요</Button>
              <Button variant="success" onClick={() => handleNext(true)} className="py-5">알아요</Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 overflow-hidden items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        </div>
        <h2 className="text-3xl font-extrabold text-indigo-900 mb-2">학습 결과</h2>
        <p className="text-slate-500 mb-8 font-medium">수고하셨습니다! 오늘의 학습 성과입니다.</p>
        
        <div className="w-full grid grid-cols-1 gap-4 mb-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">전체 글자수</p>
              <p className="text-3xl font-black text-slate-800">{quizDeck.length}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
              <p className="text-indigo-400 text-xs font-bold uppercase mb-1">소요 시간</p>
              <p className="text-2xl font-black text-indigo-700">{formatTime(sessionTimeTaken)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <p className="text-emerald-600 text-[10px] font-bold uppercase mb-1">맞음</p>
              <p className="text-xl font-black text-emerald-700">{sessionStats.correct}</p>
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <p className="text-rose-600 text-[10px] font-bold uppercase mb-1">틀림</p>
              <p className="text-xl font-black text-rose-700">{sessionStats.incorrect}</p>
            </div>
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
              <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">못 풂</p>
              <p className="text-xl font-black text-slate-600">{quizDeck.length - (sessionStats.correct + sessionStats.incorrect)}</p>
            </div>
          </div>
        </div>

        <Button className="w-full py-4 text-lg" onClick={() => navigateTo(View.HOME)}>홈으로 돌아가기</Button>
      </div>
    );
  };

  const renderReview = () => (
    <div className="p-6 max-w-md mx-auto animate-in slide-in-from-right duration-300 min-h-screen bg-slate-50 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => window.history.back()} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 transition-colors active:bg-slate-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        <h2 className="text-2xl font-bold text-slate-800">복습 목록</h2>
      </div>
      {mistakeItems.length === 0 ? (
        <div className="text-center mt-20"><p className="text-slate-500 font-bold">복습할 글자가 없습니다. 완벽해요!</p><Button onClick={() => window.history.back()} variant="outline" className="mt-6 mx-auto">홈으로</Button></div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {mistakeItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group animate-in zoom-in duration-200">
                <div className="flex items-center gap-3"><span className="text-3xl font-bold text-indigo-900 font-kana">{item.char}</span><span className="text-[10px] text-indigo-400 uppercase font-black tracking-widest">{item.romaji}</span></div>
                <button onClick={() => setMistakes(prev => prev.filter(mId => mId !== item.id))} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 mt-6">
            <Button variant="danger" onClick={() => startQuiz(mistakeItems)}>복습 시작하기</Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderWriting = () => {
    const item = quizDeck[currentIndex];
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 overflow-hidden">
        <div className="p-4 flex items-center justify-between bg-white border-b border-slate-100">
          <button onClick={() => window.history.back()} className="text-slate-400 p-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          <span className="text-lg font-bold text-slate-800">쓰기: <span className="text-indigo-600 uppercase ml-1 font-black">{item?.romaji}</span></span>
          <button onClick={() => setWritingPickerOpen(true)} className="text-slate-400 p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
        {item ? (
          <>
            <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden">
              <div className="flex-1 relative"><DrawingCanvas guideChar={item.char} /></div>
            </div>
            <div className="p-8 pb-8 bg-white rounded-t-[3rem] shadow-2xl flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => { if (currentIndex > 0) setCurrentIndex(prev => prev - 1); }}>이전</Button>
              <Button className="flex-1" onClick={() => { if (currentIndex < quizDeck.length - 1) setCurrentIndex(prev => prev + 1); else window.history.back(); }}>{currentIndex < quizDeck.length - 1 ? '다음' : '완료'}</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-slate-400">데이터가 없습니다.</div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {currentView === View.HOME && renderHome()}
      {currentView === View.QUIZ && renderQuiz()}
      {currentView === View.REVIEW && renderReview()}
      {currentView === View.WRITING && renderWriting()}
      {currentView === View.SUMMARY && renderSummary()}
      {renderWritingPicker()}
      {renderQuizPicker()}
    </div>
  );
};

export default App;