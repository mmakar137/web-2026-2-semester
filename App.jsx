import React, { useState, useEffect } from 'react';

const App = () => {
  const [decks, setDecks] = useState({});
  const [currentDeckId, setCurrentDeckId] = useState(null);
  const [editCardId, setEditCardId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFront, setShowFront] = useState(true);
  const [frontInput, setFrontInput] = useState('');
  const [backInput, setBackInput] = useState('');
  const [msg, setMsg] = useState('');
  const [studyMode, setStudyMode] = useState('all');

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 1200);
  };

  const getDeck = () => decks[currentDeckId];
  const getMode = () => studyMode;

  const getFilteredIds = () => {
    const deck = getDeck();
    if (!deck) return [];
    return deck.order.filter(id => {
      const card = deck.cards.find(c => c.id === id);
      return getMode() === 'all' || !card.learned;
    });
  };

  const getCurrentCard = () => {
    const ids = getFilteredIds();
    const id = ids[currentIndex];
    return getDeck()?.cards.find(c => c.id === id);
  };

  const save = () => {
    if (Object.keys(decks).length && currentDeckId) {
      localStorage.setItem('flashcards-data', JSON.stringify({ decks, currentDeckId }));
    }
  };

  useEffect(() => {
    const data = localStorage.getItem('flashcards-data');
    if (data) {
      const parsed = JSON.parse(data);
      setDecks(parsed.decks);
      setCurrentDeckId(parsed.currentDeckId);
    } else {
      const defaultDecks = {
        d1: {
          name: 'Моя колода',
          cards: [
            { id: 1, front: 'HTML', back: 'HyperText', learned: false },
            { id: 2, front: 'CSS', back: 'Styles', learned: false },
            { id: 3, front: 'JS', back: 'JavaScript', learned: false }
          ],
          order: [1, 2, 3]
        }
      };
      setDecks(defaultDecks);
      setCurrentDeckId('d1');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      save();
    }, 3000);
    return () => clearInterval(interval);
  }, [decks, currentDeckId]);

  const addCard = () => {
    const front = frontInput.trim();
    const back = backInput.trim();
    if (!front || !back) return showMsg('Заполните оба поля');
    
    const deck = getDeck();
    if (!deck) return;
    
    if (editCardId) {
      const updatedCards = deck.cards.map(c => 
        c.id === editCardId ? { ...c, front: front, back: back } : c
      );
      setDecks(prev => ({ ...prev, [currentDeckId]: { ...deck, cards: updatedCards } }));
      setEditCardId(null);
    } else {
      const newId = Date.now();
      const newCard = { id: newId, front: front, back: back, learned: false };
      setDecks(prev => ({
        ...prev,
        [currentDeckId]: {
          ...deck,
          cards: [...deck.cards, newCard],
          order: [...deck.order, newId]
        }
      }));
    }
    setFrontInput('');
    setBackInput('');
  };

  const resetForm = () => {
    setFrontInput('');
    setBackInput('');
    setEditCardId(null);
  };

  const editCard = (id) => {
    const deck = getDeck();
    const card = deck.cards.find(c => c.id === id);
    setFrontInput(card.front);
    setBackInput(card.back);
    setEditCardId(id);
  };

  const deleteCard = (id) => {
    const deck = getDeck();
    setDecks(prev => ({
      ...prev,
      [currentDeckId]: {
        ...deck,
        cards: deck.cards.filter(c => c.id !== id),
        order: deck.order.filter(o => o !== id)
      }
    }));
    if (editCardId === id) {
      resetForm();
    }
  };

  const toggleLearned = (id) => {
    const deck = getDeck();
    setDecks(prev => ({
      ...prev,
      [currentDeckId]: {
        ...deck,
        cards: deck.cards.map(c => 
          c.id === id ? { ...c, learned: !c.learned } : c
        )
      }
    }));
  };

  const flip = () => {
    setShowFront(!showFront);
  };

  const next = () => {
    const ids = getFilteredIds();
    if (currentIndex + 1 >= ids.length) return;
    setCurrentIndex(currentIndex + 1);
    setShowFront(true);
  };

  const prev = () => {
    if (currentIndex <= 0) return;
    setCurrentIndex(currentIndex - 1);
    setShowFront(true);
  };

  const markCard = () => {
    const card = getCurrentCard();
    if (!card) return;
    toggleLearned(card.id);
    setCurrentIndex(0);
    setShowFront(true);
  };

  const shuffle = () => {
    const deck = getDeck();
    const ids = getFilteredIds().slice();
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    if (getMode() === 'all') {
      setDecks(prev => ({ ...prev, [currentDeckId]: { ...deck, order: ids } }));
    } else {
      const learned = deck.order.filter(id => {
        const card = deck.cards.find(c => c.id === id);
        return card.learned;
      });
      setDecks(prev => ({ ...prev, [currentDeckId]: { ...deck, order: [...ids, ...learned] } }));
    }
    setCurrentIndex(0);
    setShowFront(true);
  };

  const newDeck = () => {
    const name = prompt('Название колоды');
    if (!name) return;
    const id = 'd' + Date.now();
    setDecks(prev => ({ ...prev, [id]: { name: name, cards: [], order: [] } }));
    setCurrentDeckId(id);
    setCurrentIndex(0);
    setShowFront(true);
  };

  const deleteDeck = () => {
    const deckKeys = Object.keys(decks);
    if (deckKeys.length < 2) {
      showMsg('Нельзя удалить последнюю');
      return;
    }
    const newDecks = { ...decks };
    delete newDecks[currentDeckId];
    setDecks(newDecks);
    setCurrentDeckId(deckKeys[0] === currentDeckId ? deckKeys[1] : deckKeys[0]);
    setCurrentIndex(0);
    setShowFront(true);
  };

  const handleDeckChange = (e) => {
    setCurrentDeckId(e.target.value);
    setCurrentIndex(0);
    setShowFront(true);
    setEditCardId(null);
    setFrontInput('');
    setBackInput('');
  };

  const handleModeChange = (mode) => {
    setStudyMode(mode);
    setCurrentIndex(0);
    setShowFront(true);
  };

  const currentDeck = getDeck();
  const filteredIds = getFilteredIds();
  const currentCard = getCurrentCard();

  return (
    <div className="app">
      <h1>Flashcards</h1>

      <div className="bar">
        <select value={currentDeckId || ''} onChange={handleDeckChange}>
          {Object.entries(decks).map(([id, deck]) => (
            <option key={id} value={id}>{deck.name}</option>
          ))}
        </select>
        <button onClick={newDeck}>+</button>
        <button onClick={deleteDeck}>-</button>
      </div>

      <div className="form">
        <input 
          type="text"
          placeholder="Вопрос" 
          value={frontInput} 
          onChange={(e) => setFrontInput(e.target.value)} 
        />
        <input 
          type="text"
          placeholder="Ответ" 
          value={backInput} 
          onChange={(e) => setBackInput(e.target.value)} 
        />
        <button onClick={addCard}>
          {editCardId ? 'Сохранить' : 'Добавить'}
        </button>
        {editCardId && (
          <button onClick={resetForm}>Отмена</button>
        )}
        {msg && <span className="msg">{msg}</span>}
      </div>

      <div className="study">
        <div>
          <label>
            <input 
              type="radio" 
              name="mode" 
              value="all" 
              checked={studyMode === 'all'} 
              onChange={() => handleModeChange('all')} 
            />
            Все
          </label>
          <label>
            <input 
              type="radio" 
              name="mode" 
              value="unlearned" 
              checked={studyMode === 'unlearned'} 
              onChange={() => handleModeChange('unlearned')} 
            />
            Невыученные
          </label>
          <button onClick={shuffle}>Перемешать</button>
        </div>

        <div className="card" onClick={flip}>
          <div className="card-text">
            {!currentDeck || filteredIds.length === 0 ? 'Нет карточек' : (showFront ? currentCard?.front : currentCard?.back)}
          </div>
        </div>

        {filteredIds.length > 0 && (
          <>
            <div>
              <button onClick={prev} disabled={currentIndex === 0}>
                &lt;
              </button>
              <span className="position">
                {currentIndex + 1} / {filteredIds.length}
              </span>
              <button onClick={next} disabled={currentIndex + 1 >= filteredIds.length}>
                &gt;
              </button>
            </div>
            <div>
              <button onClick={flip}>Перевернуть</button>
              <button onClick={markCard}>
                {currentCard?.learned ? 'Снять' : 'Выучена'}
              </button>
            </div>
          </>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Вопрос</th>
            <th>Ответ</th>
            <th>✓</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentDeck && currentDeck.cards.map(card => (
            <tr key={card.id}>
              <td>{card.front}</td>
              <td>{card.back}</td>
              <td>
                <input 
                  type="checkbox" 
                  checked={card.learned} 
                  onChange={() => toggleLearned(card.id)} 
                />
              </td>
              <td>
                <button onClick={() => editCard(card.id)}>ред</button>
                <button onClick={() => deleteCard(card.id)}>уд</button>
              </td>
            </tr>
          ))}
          {currentDeck && currentDeck.cards.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>
                Нет карточек. Добавьте первую!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default App;