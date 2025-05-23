const timeline = document.getElementById('timeline');
const form = document.getElementById('event-form');
const eventDateInput = document.getElementById('event-date');
const eventDescInput = document.getElementById('event-desc');
const eventCategoryInput = document.getElementById('event-category'); // Adicionado para clareza
const eventImageInput = document.getElementById('event-image');

const categoryIcons = {
    amor: '❤️',
    aniversario: '🎂',
    viagem: '✈️',
    comemoracao: '🎉',
    outro: '⭐',
};
const filterCategory = document.getElementById('filter-category');

// Função para formatar data para DD/MM/AAAA (CORRIGIDA)
function formatDate(dateStr) { // dateStr é 'YYYY-MM-DD'
    if (!dateStr) return ''; // Adicionado para segurança caso dateStr seja undefined ou null
    const parts = dateStr.split('-'); // parts será ['YYYY', 'MM', 'DD']
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // Formato DD/MM/YYYY
    }
    return dateStr; // Retorna original se não estiver no formato YYYY-MM-DD
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
    eventElem.setAttribute('data-category', event.category); // Para possível estilização/filtragem futura

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
        if (confirm('Tem certeza que deseja apagar este evento?')) { // Confirmação
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

    filteredEvents.forEach(event => {
        const eventElem = createEventElement(event);
        timeline.appendChild(eventElem);
    });
}

filterCategory.addEventListener('change', renderEvents);

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
    const category = eventCategoryInput.value; // Usando a variável declarada

    if (!date || !desc || !category) {
        alert('Por favor, preencha data, descrição e categoria.');
        return;
    }

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            addEventToStorage(date, desc, category, evt.target.result);
        };
        reader.onerror = function() { // Adicionado error handler básico
            alert('Erro ao ler a imagem.');
            form.reset(); // Limpa o form mesmo em erro de imagem
            eventImageInput.value = ''; // Limpa o input de arquivo
        };
        reader.readAsDataURL(imageFile);
    } else {
        addEventToStorage(date, desc, category, null);
    }
});

// Função para adicionar evento ao localStorage e atualizar timeline (renomeada de addEvent para clareza)
function addEventToStorage(date, desc, category, image) {
    const events = loadEvents();
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2); // ID único um pouco mais robusto
    events.push({ id, date, desc, category, image });
    saveEvents(events);
    renderEvents();

    form.reset();
    eventImageInput.value = ''; // Garante que o input de arquivo seja limpo
}

// Variáveis do modal
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editDate = document.getElementById('edit-date');
const editDesc = document.getElementById('edit-desc');
const editCategory = document.getElementById('edit-category');
const editImage = document.getElementById('edit-image');
const editCancelBtn = document.getElementById('edit-cancel-btn');

let currentEditEventId = null; // Renomeado para clareza (era editId)

// Função abrir modal para editar
function openEditModal(id) {
    const events = loadEvents();
    const eventToEdit = events.find(ev => ev.id === id);
    if (!eventToEdit) return;

    currentEditEventId = id;
    editDate.value = eventToEdit.date;
    editDesc.value = eventToEdit.desc;
    editCategory.value = eventToEdit.category;
    // eventToEdit.image não é setado no input file, ele é apenas para visualização ou para manter se não alterado
    editImage.value = ''; // Limpa o seletor de arquivo anterior

    editModal.style.display = 'flex';
}

// Fechar modal
editCancelBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
    currentEditEventId = null; // Limpa o ID ao cancelar
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
        reader.onerror = function() {
            alert('Erro ao ler a nova imagem para edição.');
        };
        reader.readAsDataURL(imageFile);
    } else {
        updateEventInStorage(null); // Passa null se nenhuma nova imagem foi selecionada
    }
});

function updateEventInStorage(newBase64Image) {
    let events = loadEvents();
    const eventIndex = events.findIndex(ev => ev.id === currentEditEventId);
    if (eventIndex === -1) return;

    events[eventIndex].date = editDate.value;
    events[eventIndex].desc = editDesc.value.trim();
    events[eventIndex].category = editCategory.value;

    if (newBase64Image) { // Se uma nova imagem foi carregada (não é null)
        events[eventIndex].image = newBase64Image;
    }
    // Se newBase64Image for null, a imagem existente é mantida.
    // Para permitir REMOVER uma imagem, seria necessário um controle adicional (ex: checkbox "Remover Imagem")
    // e, se marcado, faria: events[eventIndex].image = null;

    saveEvents(events);
    renderEvents();
    editModal.style.display = 'none';
    currentEditEventId = null; // Limpa o ID após salvar
}

// Inicializa timeline na abertura da página
renderEvents();

// Fechar modal clicando fora (opcional, mas boa UX)
window.addEventListener('click', (event) => {
    if (event.target === editModal) {
        editModal.style.display = 'none';
        currentEditEventId = null;
    }
});