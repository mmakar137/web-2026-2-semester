let decks = {};
let currentDeckId;
let editCardId = null;
let currentIndex = 0;
let showFront = true;

const $ = id => document.getElementById(id);

const getDeck = () => decks[currentDeckId];
const getMode = () => document.querySelector('[name="mode"]:checked').value;

// ---------- UI ----------

const showMsg = text => {
    const el = $('msg');
    el.innerText = text;
    el.style.opacity = 1;
    setTimeout(() => el.style.opacity = 0, 1200);
};

// ---------- STORAGE ----------

const save = () => {
    let str = currentDeckId + '|';

    str += Object.entries(decks).map(([id, d]) =>
        id + ':' + d.name + ':' +
        d.cards.map(c =>
            [c.id, c.front, c.back, +c.learned].join(',')
        ).join('&') +
        ':' + d.order.join(',')
    ).join(';');

    localStorage.f = str;
};

const load = () => {
    let raw = localStorage.f;

    if (!raw) {
        decks.d1 = {
            name: 'Моя карточка',
            cards: [
                { id: 1, front: 'HTML', back: 'HyperText', learned: 0 },
                { id: 2, front: 'CSS', back: 'Styles', learned: 0 },
                { id: 3, front: 'JS', back: 'JavaScript', learned: 0 }
            ],
            order: [1, 2, 3]
        };
        currentDeckId = 'd1';
        return;
    }

    let [id, rest] = raw.split('|');
    currentDeckId = id;

    rest.split(';').map(d => {
        let [deckId, name, cards, order] = d.split(':');

        decks[deckId] = {
            name,
            cards: cards
                ? cards.split('&').map(x => {
                    let [id, f, b, l] = x.split(',');
                    return { id:+id, front:f, back:b, learned:l==1 };
                })
                : [],
            order: order ? order.split(',').map(Number) : []
        };
    });
};

// ---------- LOGIC ----------

const getFilteredIds = () => {
    let deck = getDeck();
    return deck.order.filter(id => {
        let c = deck.cards.find(x => x.id === id);
        return getMode() === 'all' || !c.learned;
    });
};

const getCurrentCard = () => {
    let ids = getFilteredIds();
    let id = ids[currentIndex];
    return getDeck().cards.find(c => c.id === id);
};

// ---------- RENDER ----------

const renderDecks = () => {
    $('deckSelect').innerHTML =
        Object.entries(decks).map(([id,d]) =>
            `<option value="${id}" ${id===currentDeckId?'selected':''}>${d.name}</option>`
        ).join('');
};

const renderTable = () => {
    const tbody = $('tbody');
    tbody.innerHTML = '';

    let deck = getDeck();

    if (!deck.cards.length) {
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        td.colSpan = 4;
        td.innerText = 'Нет карточек';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    deck.cards.map(c => {
        let tr = document.createElement('tr');
        tr.dataset.id = c.id;

        let td1 = document.createElement('td');
        td1.innerText = c.front;

        let td2 = document.createElement('td');
        td2.innerText = c.back;

        let td3 = document.createElement('td');
        let chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.checked = c.learned;
        chk.dataset.action = 'toggle';
        td3.appendChild(chk);

        let td4 = document.createElement('td');

        let editBtn = document.createElement('button');
        editBtn.innerText = 'ред';
        editBtn.dataset.action = 'edit';

        let delBtn = document.createElement('button');
        delBtn.innerText = 'уд';
        delBtn.dataset.action = 'delete';

        td4.append(editBtn, delBtn);

        tr.append(td1, td2, td3, td4);
        tbody.appendChild(tr);
    });
};

const renderStudy = () => {
    let ids = getFilteredIds();
    let c = getCurrentCard();

    $('emptyMsg').style.display = ids.length ? 'none' : 'block';
    $('card').style.display = ids.length ? 'flex' : 'none';

    if (!c) {
        $('pos').innerText = '0/0';
        return;
    }

    $('cardText').innerText = showFront ? c.front : c.back;
    $('pos').innerText = (currentIndex+1)+'/'+ids.length;
    $('markBtn').innerText = c.learned ? 'Снять' : 'Выучена';
};

const render = () => {
    renderDecks();
    renderTable();
    renderStudy();
};

// ---------- ACTIONS ----------

const add = () => {
    let f = $('front').value.trim();
    let b = $('back').value.trim();

    if (!f || !b) return showMsg('Заполните оба поля');

    let d = getDeck();

    if (editCardId) {
        let c = d.cards.find(x=>x.id===editCardId);
        c.front = f;
        c.back = b;
        editCardId = null;
    } else {
        let id = Date.now();
        d.cards.push({ id, front:f, back:b, learned:0 });
        d.order.push(id);
    }

    resetForm();
    render();
};

const resetForm = () => {
    $('front').value = '';
    $('back').value = '';
    $('addBtn').innerText = 'Добавить';
    $('cancelBtn').style.display = 'none';
};

const edit = id => {
    let c = getDeck().cards.find(x=>x.id===id);
    $('front').value = c.front;
    $('back').value = c.back;
    editCardId = id;
    $('addBtn').innerText = 'Сохранить';
    $('cancelBtn').style.display = 'inline';
};

const del = id => {
    let d = getDeck();
    d.cards = d.cards.filter(x=>x.id!==id);
    d.order = d.order.filter(x=>x!==id);
    if (editCardId===id) resetForm();
    render();
};

const toggle = id => {
    let c = getDeck().cards.find(x=>x.id===id);
    c.learned = !c.learned;
    render();
};

// ---------- STUDY ----------

const flip = () => { showFront=!showFront; render(); };

const next = () => {
    if (currentIndex+1 >= getFilteredIds().length) return;
    currentIndex++;
    showFront = true;
    render();
};

const prev = () => {
    if (currentIndex <= 0) return;
    currentIndex--;
    showFront = true;
    render();
};

const mark = () => {
    let c = getCurrentCard();
    if (!c) return;
    c.learned = !c.learned;
    currentIndex = 0;
    showFront = true;
    render();
};

const shuffle = () => {
    let d = getDeck();
    let ids = getFilteredIds().slice();

    ids.sort(()=>Math.random()-0.5);

    if (getMode()==='all') d.order = ids;
    else {
        let learned = d.order.filter(id =>
            d.cards.find(c=>c.id===id).learned
        );
        d.order = [...ids, ...learned];
    }

    currentIndex = 0;
    showFront = true;
    render();
};

// ---------- DECKS ----------

const newDeck = () => {
    let name = prompt('Название колоды');
    if (!name) return;

    let id = 'd'+Date.now();
    decks[id] = { name, cards:[], order:[] };
    currentDeckId = id;
    render();
};

const deleteDeck = () => {
    if (Object.keys(decks).length < 2)
        return showMsg('Нельзя удалить последнюю');

    delete decks[currentDeckId];
    currentDeckId = Object.keys(decks)[0];
    render();
};

// ---------- INIT ----------

load();
render();
setInterval(save, 3000);

// ---------- EVENTS ----------

$('addBtn').addEventListener('click', add);
$('cancelBtn').addEventListener('click', resetForm);

$('prev').addEventListener('click', prev);
$('next').addEventListener('click', next);
$('flipBtn').addEventListener('click', flip);
$('markBtn').addEventListener('click', mark);
$('shuffleBtn').addEventListener('click', shuffle);

$('newDeckBtn').addEventListener('click', newDeck);
$('delDeckBtn').addEventListener('click', deleteDeck);

$('deckSelect').addEventListener('change', e => {
    currentDeckId = e.target.value;
    currentIndex = 0;
    render();
});

document.querySelectorAll('[name="mode"]').forEach(r =>
    r.addEventListener('change', () => {
        currentIndex = 0;
        render();
    })
);

$('card').addEventListener('click', flip);

// делегирование таблицы

$('tbody').addEventListener('click', e => {
    let action = e.target.dataset.action;
    let tr = e.target.closest('tr');
    if (!tr) return;

    let id = +tr.dataset.id;

    if (action === 'edit') edit(id);
    if (action === 'delete') del(id);
});

$('tbody').addEventListener('change', e => {
    if (e.target.dataset.action === 'toggle') {
        let tr = e.target.closest('tr');
        let id = +tr.dataset.id;
        toggle(id);
    }
});