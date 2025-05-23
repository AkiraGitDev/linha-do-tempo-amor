const timeline = document.getElementById('timeline');
const form = document.getElementById('event-form');
const eventDateInput = document.getElementById('event-date');
const eventDescInput = document.getElementById('event-desc');
const eventImageInput = document.getElementById('event-image');
const categoryIcons = {
    amor: '❤️',
    aniversario: '🎂',
    viagem: '✈️',
    comemoracao: '🎉',
    outro: '⭐',
};


// Função para formatar data para DD/MM/AAAA
function formatDate(dateStr) {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

// Carregar eventos do localStorage
function loadEvents() {
    const events = JSON.parse(localStorage.getItem('timelineEvents')) || [];
    return events;
}

// Salvar eventos no localStorage
function saveEvents(events) {
    localStorage.setItem('timelineEvents', JSON.stringify(events));
}

// Criar elemento de evento na timeline
function createEventElement(event, index) {
    const eventElem = document.createElement('div');
    eventElem.classList.add('timeline-event');

    // Ícone categoria
    const iconSpan = document.createElement('span');
    iconSpan.classList.add('event-category-icon');
    iconSpan.textContent = categoryIcons[event.category] || '⭐';

    // Data formatada
    const eventDateElem = document.createElement('div');
    eventDateElem.classList.add('event-date');
    eventDateElem.textContent = formatDate(event.date);

    // Botão apagar
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Apagar evento';
    deleteBtn.onclick = () => {
        deleteEvent(index);
    };

    // Descrição do evento
    const eventDescElem = document.createElement('div');
    eventDescElem.classList.add('event-desc');
    eventDescElem.textContent = event.desc;

    eventElem.appendChild(iconSpan);
    eventElem.appendChild(eventDateElem);
    eventElem.appendChild(deleteBtn);
    eventElem.appendChild(eventDescElem);

    if (event.image) {
        const imgElem = document.createElement('img');
        imgElem.classList.add('event-image');
        imgElem.src = event.image;
        imgElem.alt = 'Imagem do evento';
        eventElem.appendChild(imgElem);
    }

    return eventElem;
}


// Renderizar todos os eventos na timeline
function renderEvents() {
    timeline.innerHTML = '';
    const events = loadEvents();

    // Ordenar eventos pela data (mais antigos à esquerda)
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    events.forEach((event, index) => {
        const eventElem = createEventElement(event, index);
        timeline.appendChild(eventElem);
    });
}

// Apagar evento pelo índice
function deleteEvent(index) {
    const events = loadEvents();
    events.splice(index, 1);
    saveEvents(events);
    renderEvents();
}

// Adicionar novo evento
form.addEventListener('submit', e => {
    e.preventDefault();

    const date = eventDateInput.value;
    const desc = eventDescInput.value.trim();
    const imageFile = eventImageInput?.files[0] || null;
    const eventCategoryInput = document.getElementById('event-category');

    // dentro do listener do form
    const category = eventCategoryInput.value;

    if (!date || !desc || !category) {
        alert('Por favor, preencha data, descrição e categoria.');
        return;
    }

    // ao adicionar evento, passe a categoria também
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            addEvent(date, desc, category, evt.target.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        addEvent(date, desc, category, null);
    }


    if (!date || !desc) {
        alert('Por favor, preencha a data e a descrição.');
        return;
    }

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            addEvent(date, desc, evt.target.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        addEvent(date, desc, null);
    }
});

// Função para adicionar evento ao localStorage e atualizar timeline
function addEvent(date, desc, category, image) {
    const events = loadEvents();
    events.push({ date, desc, category, image });
    saveEvents(events);
    renderEvents();

    form.reset();
}


// Inicializa timeline na abertura da página
renderEvents();
