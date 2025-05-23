// Elementos do DOM
const timeline = document.getElementById('timeline');
const form = document.getElementById('event-form');
const eventDateInput = document.getElementById('event-date');
const eventDescInput = document.getElementById('event-desc');
const eventCategoryInput = document.getElementById('event-category');
const eventImageInput = document.getElementById('event-image');
const filterCategory = document.getElementById('filter-category');

// Novos elementos para a funcionalidade de mostrar/esconder formulário
const showAddEventFormBtn = document.getElementById('show-add-event-form-btn');
const formContainer = document.getElementById('form-container');
const cancelAddEventBtn = document.getElementById('cancel-add-event-btn');

const categoryIcons = {
    amor: '❤️',
    aniversario: '🎂',
    viagem: '✈️',
    comemoracao: '🎉',
    outro: '⭐',
};

// Função para formatar data para DD/MM/AAAA
function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
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

// --- Funções para controlar visibilidade do formulário de adicionar evento ---
function showForm() {
    formContainer.style.display = 'block';
    showAddEventFormBtn.style.display = 'none';
    eventDateInput.focus();
}

function hideForm() {
    formContainer.style.display = 'none';
    showAddEventFormBtn.style.display = 'block';
    form.reset();
    eventImageInput.value = '';
}

// Event Listeners para os novos botões
showAddEventFormBtn.addEventListener('click', showForm);
cancelAddEventBtn.addEventListener('click', hideForm);


// Criar elemento de evento na timeline
function createEventElement(event) {
    const eventElem = document.createElement('div');
    eventElem.classList.add('timeline-event');
    eventElem.setAttribute('data-category', event.category);

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('event-category-icon');
    iconSpan.textContent = categoryIcons[event.category] || '⭐';

    const eventDateElem = document.createElement('div');
    eventDateElem.classList.add('event-date');
    eventDateElem.textContent = formatDate(event.date);

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Apagar evento';
    deleteBtn.onclick = () => {
        if (confirm('Tem certeza que deseja apagar este evento?')) {
            deleteEvent(event.id);
        }
    };

    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-btn');
    editBtn.textContent = '✎';
    editBtn.title = 'Editar evento';
    editBtn.onclick = () => openEditModal(event.id);

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

    const selectedCategory = filterCategory.value;
    let filteredEvents = selectedCategory === 'all'
        ? events
        : events.filter(event => event.category === selectedCategory);

    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (filteredEvents.length === 0) {
        timeline.innerHTML = '<p style="text-align:center; color: #888; width:100%;">Nenhum momento especial adicionado ainda. Que tal criar um?</p>';
    } else {
        filteredEvents.forEach(event => {
            const eventElem = createEventElement(event);
            timeline.appendChild(eventElem);
        });
    }
}

filterCategory.addEventListener('change', renderEvents);

// Apagar evento pelo ID
function deleteEvent(id) {
    let events = loadEvents();
    events = events.filter(event => event.id !== id);
    saveEvents(events);
    renderEvents();
}

// Adicionar novo evento (EventListener do formulário)
form.addEventListener('submit', e => {
    e.preventDefault();

    const date = eventDateInput.value;
    const desc = eventDescInput.value.trim();
    const imageFile = eventImageInput?.files[0] || null;
    const category = eventCategoryInput.value;

    if (!date || !desc || !category) {
        alert('Por favor, preencha data, descrição e categoria.');
        return;
    }

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            addEventToStorage(date, desc, category, evt.target.result);
        };
        reader.onerror = function () {
            alert('Erro ao ler a imagem.');
            eventImageInput.value = '';
        };
        reader.readAsDataURL(imageFile);
    } else {
        addEventToStorage(date, desc, category, null);
    }
});

// Função para adicionar evento ao localStorage e atualizar timeline
function addEventToStorage(date, desc, category, image) {
    const events = loadEvents();
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    events.push({ id, date, desc, category, image });
    saveEvents(events);
    renderEvents();
    hideForm();
}

// Variáveis do modal de edição
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editDate = document.getElementById('edit-date');
const editDesc = document.getElementById('edit-desc');
const editCategoryModal = document.getElementById('edit-category'); // Renomeado para evitar conflito de nome
const editImage = document.getElementById('edit-image');
const editCancelBtn = document.getElementById('edit-cancel-btn');

let currentEditEventId = null;

// Função abrir modal para editar
function openEditModal(id) {
    const events = loadEvents();
    const eventToEdit = events.find(ev => ev.id === id);
    if (!eventToEdit) return;

    currentEditEventId = id;
    editDate.value = eventToEdit.date;
    editDesc.value = eventToEdit.desc;
    editCategoryModal.value = eventToEdit.category; // Usando a variável renomeada
    editImage.value = '';

    editModal.style.display = 'flex';
}

// Fechar modal de edição
editCancelBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
    currentEditEventId = null;
});

// Salvar edição
editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentEditEventId) return;

    const imageFile = editImage?.files[0] || null;

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            updateEventInStorage(evt.target.result);
        };
        reader.onerror = function () {
            alert('Erro ao ler a nova imagem para edição.');
        };
        reader.readAsDataURL(imageFile);
    } else {
        updateEventInStorage(null);
    }
});

function updateEventInStorage(newBase64Image) {
    let events = loadEvents();
    const eventIndex = events.findIndex(ev => ev.id === currentEditEventId);
    if (eventIndex === -1) return;

    events[eventIndex].date = editDate.value;
    events[eventIndex].desc = editDesc.value.trim();
    events[eventIndex].category = editCategoryModal.value;

    if (newBase64Image) {
        events[eventIndex].image = newBase64Image;
    }
    // Nota: A lógica para REMOVER uma imagem existente (se newBase64Image for null e uma imagem já existir)
    // não está implementada aqui. Se quiser isso, precisaria de um checkbox "Remover imagem" no modal.

    saveEvents(events);
    renderEvents();
    editModal.style.display = 'none';
    currentEditEventId = null;
}

// Inicializa timeline na abertura da página
renderEvents();

// Fechar modal de edição clicando fora
window.addEventListener('click', (event) => {
    if (event.target === editModal) {
        editModal.style.display = 'none';
        currentEditEventId = null;
    }
});

hideForm();




// --- FUNCIONALIDADE DO CONTADOR DE RELACIONAMENTO ---

const relationshipCounterElement = document.getElementById('relationship-counter');

// ATENÇÃO: Altere esta data para a data e hora exatas do início do relacionamento.
// Formato: "AAAA-MM-DDTHH:MM:SS" (Ex: "2022-01-15T20:00:00")
// Usando 17 de Janeiro de 2025, 18:30:00 como placeholder:
const relationshipStartDateString = "2025-01-17T18:30:00";

function updateRelationshipCounter() {
    if (!relationshipCounterElement) return; // Sai se o elemento não existir

    const startDate = new Date(relationshipStartDateString);
    const now = new Date();

    let diffInMilliseconds = now - startDate;

    // Se a data de início for no futuro (em relação ao relógio do navegador do usuário)
    if (diffInMilliseconds < 0) {
        relationshipCounterElement.textContent = "Nossa contagem especial começa em breve! ❤️";
        return;
    }

    // Cálculo de tempo
    let remainingMilliseconds = diffInMilliseconds;

    const daysInMs = 24 * 60 * 60 * 1000;
    const hoursInMs = 60 * 60 * 1000;
    const minutesInMs = 60 * 1000;
    const secondsInMs = 1000;

    const days = Math.floor(remainingMilliseconds / daysInMs);
    remainingMilliseconds %= daysInMs;

    const hours = Math.floor(remainingMilliseconds / hoursInMs);
    remainingMilliseconds %= hoursInMs;

    const minutes = Math.floor(remainingMilliseconds / minutesInMs);
    remainingMilliseconds %= minutesInMs;

    const seconds = Math.floor(remainingMilliseconds / secondsInMs);

    // Formatação do texto do contador
    // Você pode personalizar esta mensagem como quiser!
    const pluralS = (n) => (n !== 1 ? 's' : '');
    relationshipCounterElement.innerHTML = `<span>Juntos há: </span> <strong>${days} dia${pluralS(days)}</strong>, ` +
        `<strong>${String(hours).padStart(2, '0')}h</strong> ` +
        `<strong>${String(minutes).padStart(2, '0')}m</strong> ` +
        `<strong>${String(seconds).padStart(2, '0')}s</strong> ✨`;
}

// Garante que o DOM está carregado antes de tentar acessar o elemento e iniciar o contador
document.addEventListener('DOMContentLoaded', () => {
    if (relationshipCounterElement) {
        updateRelationshipCounter();
        setInterval(updateRelationshipCounter, 1000);
    }
});

if (document.getElementById('relationship-counter')) {
    updateRelationshipCounter();
    setInterval(updateRelationshipCounter, 1000);
}