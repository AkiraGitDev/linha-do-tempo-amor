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
const filterCategory = document.getElementById('filter-category');

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
function createEventElement(event) {
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
        deleteEvent(event.id);
    };

    // Botão editar
    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-btn');
    editBtn.textContent = '✎';
    editBtn.title = 'Editar evento';
    editBtn.onclick = () => openEditModal(event.id);

    // Descrição do evento
    const eventDescElem = document.createElement('div');
    eventDescElem.classList.add('event-desc');
    eventDescElem.textContent = event.desc;

    eventElem.appendChild(iconSpan);
    eventElem.appendChild(eventDateElem);
    eventElem.appendChild(deleteBtn);
    eventElem.appendChild(editBtn);
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

    // Filtra os eventos pela categoria selecionada no filtro
    const selectedCategory = filterCategory.value;
    let filteredEvents = selectedCategory === 'all'
        ? events
        : events.filter(event => event.category === selectedCategory);

    // Ordenar eventos pela data (mais antigos à esquerda)
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    filteredEvents.forEach(event => {
        const eventElem = createEventElement(event);
        timeline.appendChild(eventElem);
    });
}

filterCategory.addEventListener('change', () => {
    renderEvents();
});

// Apagar evento pelo ID
function deleteEvent(id) {
    let events = loadEvents();
    events = events.filter(event => event.id !== id);
    saveEvents(events);
    renderEvents();
}

// Adicionar novo evento
form.addEventListener('submit', e => {
    e.preventDefault();

    const date = eventDateInput.value;
    const desc = eventDescInput.value.trim();
    const imageFile = eventImageInput?.files[0] || null;
    const category = document.getElementById('event-category').value;

    if (!date || !desc || !category) {
        alert('Por favor, preencha data, descrição e categoria.');
        return;
    }

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            addEvent(date, desc, category, evt.target.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        addEvent(date, desc, category, null);
    }
});

// Função para adicionar evento ao localStorage e atualizar timeline
function addEvent(date, desc, category, image) {
    const events = loadEvents();
    const id = Date.now() + Math.random(); // ID único simples
    events.push({ id, date, desc, category, image });
    saveEvents(events);
    renderEvents();

    form.reset();
}

// Variáveis do modal
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editDate = document.getElementById('edit-date');
const editDesc = document.getElementById('edit-desc');
const editCategory = document.getElementById('edit-category');
const editImage = document.getElementById('edit-image');
const editCancelBtn = document.getElementById('edit-cancel-btn');

let editId = null; // id do evento que está sendo editado

// Função abrir modal para editar
function openEditModal(id) {
    const events = loadEvents();
    const event = events.find(ev => ev.id === id);
    if (!event) return;

    editId = id;
    editDate.value = event.date;
    editDesc.value = event.desc;
    editCategory.value = event.category;
    editImage.value = ''; // limpa input file

    editModal.style.display = 'flex';
}

// Fechar modal
editCancelBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});

// Salvar edição
editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const events = loadEvents();
    const event = events.find(ev => ev.id === editId);
    if (!event) return;

    if (editImage.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            updateEventWithImage(evt.target.result);
        };
        reader.readAsDataURL(editImage.files[0]);
    } else {
        updateEventWithImage(null);
    }
});

function updateEventWithImage(newImage) {
    const events = loadEvents();
    const event = events.find(ev => ev.id === editId);
    if (!event) return;

    event.date = editDate.value;
    event.desc = editDesc.value;
    event.category = editCategory.value;
    if (newImage !== null) {
        event.image = newImage;
    }

    saveEvents(events);
    renderEvents();
    editModal.style.display = 'none';
}

// Inicializa timeline na abertura da página
renderEvents();
