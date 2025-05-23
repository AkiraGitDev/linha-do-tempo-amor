// Elementos do DOM
const timeline = document.getElementById('timeline');
const form = document.getElementById('event-form');
const eventDateInput = document.getElementById('event-date');
const eventDescInput = document.getElementById('event-desc');
const eventCategoryInput = document.getElementById('event-category');
const eventImageInput = document.getElementById('event-image');
const filterCategory = document.getElementById('filter-category');
const timelineContainer = document.querySelector('.timeline-container');
const backToStartBtn = document.getElementById('back-to-start-btn');

// Elementos para a funcionalidade de mostrar/esconder formulário de adicionar evento
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
    try {
        const eventsJson = localStorage.getItem('timelineEvents');
        return eventsJson ? JSON.parse(eventsJson) : [];
    } catch (error) {
        console.error("Erro ao carregar eventos do localStorage:", error);
        localStorage.removeItem('timelineEvents'); // Limpa se estiver corrompido
        return [];
    }
}

// Salvar eventos no localStorage
function saveEvents(events) {
    try {
        localStorage.setItem('timelineEvents', JSON.stringify(events));
    } catch (error) {
        console.error("Erro ao salvar eventos no localStorage:", error);
        alert("Ocorreu um erro ao tentar salvar os dados. Verifique o espaço disponível.");
    }
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
    eventImageInput.value = ''; // Limpa especificamente o input de arquivo
}

// Event Listeners para os botões de mostrar/esconder formulário
if (showAddEventFormBtn && formContainer && cancelAddEventBtn) {
    showAddEventFormBtn.addEventListener('click', showForm);
    cancelAddEventBtn.addEventListener('click', hideForm);
}


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

    // --- SEÇÃO DE COMENTÁRIOS ---
    const commentsContainer = document.createElement('div');
    commentsContainer.classList.add('event-comments-container');

    const commentsList = document.createElement('div');
    commentsList.classList.add('event-comments-list');

    if (event.comments && event.comments.length > 0) {
        event.comments.forEach((commentText, index) => {
            const commentItemDiv = document.createElement('div');
            commentItemDiv.classList.add('event-comment-item');

            const commentP = document.createElement('p');
            commentP.classList.add('event-comment');
            commentP.textContent = commentText;

            const deleteCommentBtn = document.createElement('button');
            deleteCommentBtn.classList.add('delete-comment-btn');
            deleteCommentBtn.innerHTML = '&times;';
            deleteCommentBtn.title = 'Apagar descrição';
            deleteCommentBtn.onclick = () => {
                if (confirm(`Apagar a descrição: "${commentText.substring(0, 30)}..."?`)) {
                    deleteCommentFromEvent(event.id, index);
                }
            };

            commentItemDiv.appendChild(commentP);
            commentItemDiv.appendChild(deleteCommentBtn);
            commentsList.appendChild(commentItemDiv);
        });
    } else {
        const noCommentsP = document.createElement('p');
        noCommentsP.classList.add('no-comments-text');
        noCommentsP.textContent = 'Nenhuma observação ainda.';
        commentsList.appendChild(noCommentsP);
    }
    commentsContainer.appendChild(commentsList);

    const addCommentBtn = document.createElement('button');
    addCommentBtn.classList.add('add-comment-btn');
    addCommentBtn.textContent = '💬 Adicionar Descrição';
    addCommentBtn.onclick = () => {
        const newComment = prompt(`Adicionar observação para "${event.desc.substring(0, 30)}...":`);
        if (newComment && newComment.trim() !== '') {
            addCommentToEvent(event.id, newComment.trim());
        }
    };
    commentsContainer.appendChild(addCommentBtn);
    eventElem.appendChild(commentsContainer);

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

if (filterCategory) { // Garante que o filtro exista
    filterCategory.addEventListener('change', renderEvents);
}

// Apagar evento pelo ID
function deleteEvent(id) {
    let events = loadEvents();
    events = events.filter(event => event.id !== id);
    saveEvents(events);
    renderEvents();
}

// Adicionar novo evento (EventListener do formulário)
if (form) { // Garante que o formulário exista
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
                eventImageInput.value = ''; // Limpa se deu erro
            };
            reader.readAsDataURL(imageFile);
        } else {
            addEventToStorage(date, desc, category, null);
        }
    });
}

// Função para adicionar evento ao localStorage e atualizar timeline
function addEventToStorage(date, desc, category, image) {
    const events = loadEvents();
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    events.push({
        id,
        date,
        desc,
        category,
        image,
        comments: []
    });
    saveEvents(events);
    renderEvents();
    hideForm();
}

// Função para adicionar um comentário a um evento específico
function addCommentToEvent(eventId, commentText) {
    const events = loadEvents();
    const eventIndex = events.findIndex(event => event.id === eventId);

    if (eventIndex > -1) {
        if (!events[eventIndex].comments) {
            events[eventIndex].comments = [];
        }
        events[eventIndex].comments.push(commentText);
        saveEvents(events);
        renderEvents();
    }
}

// Função para deletar um comentário específico de um evento
function deleteCommentFromEvent(eventId, commentIndex) {
    const events = loadEvents();
    const eventArrayIndex = events.findIndex(event => event.id === eventId);

    if (eventArrayIndex > -1) {
        const eventToUpdate = events[eventArrayIndex];
        if (eventToUpdate.comments && eventToUpdate.comments[commentIndex] !== undefined) {
            eventToUpdate.comments.splice(commentIndex, 1);
            saveEvents(events);
            renderEvents();
        } else {
            console.error("Índice de comentário inválido ou array de comentários não existe.");
        }
    } else {
        console.error("Evento não encontrado para deletar comentário.");
    }
}


// Variáveis e lógica do Modal de Edição
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editDate = document.getElementById('edit-date');
const editDesc = document.getElementById('edit-desc');
const editCategoryModal = document.getElementById('edit-category');
const editImage = document.getElementById('edit-image');
const editCancelBtn = document.getElementById('edit-cancel-btn');

let currentEditEventId = null;

function openEditModal(id) {
    const events = loadEvents();
    const eventToEdit = events.find(ev => ev.id === id);
    if (!eventToEdit) return;

    currentEditEventId = id;
    editDate.value = eventToEdit.date;
    editDesc.value = eventToEdit.desc;
    editCategoryModal.value = eventToEdit.category;
    editImage.value = ''; // Limpa o input de arquivo

    if (editModal) editModal.style.display = 'flex';
}

if (editCancelBtn && editModal) {
    editCancelBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
        currentEditEventId = null;
    });
}

if (editForm) {
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
            updateEventInStorage(null); // Passa null se nenhuma nova imagem foi selecionada
        }
    });
}

function updateEventInStorage(newBase64Image) {
    let events = loadEvents();
    const eventIndex = events.findIndex(ev => ev.id === currentEditEventId);
    if (eventIndex === -1) return;

    events[eventIndex].date = editDate.value;
    events[eventIndex].desc = editDesc.value.trim();
    events[eventIndex].category = editCategoryModal.value;

    // Mantém a imagem existente se nenhuma nova for fornecida
    if (newBase64Image) {
        events[eventIndex].image = newBase64Image;
    }
    // Nota: A edição de comentários não está integrada neste modal.
    // Comentários são adicionados/removidos diretamente no card do evento.

    saveEvents(events);
    renderEvents();
    if (editModal) editModal.style.display = 'none';
    currentEditEventId = null;
}

// Fechar modal de edição clicando fora
if (editModal) {
    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';
            currentEditEventId = null;
        }
    });
}

// --- FUNCIONALIDADE DO CONTADOR DE RELACIONAMENTO ---
const relationshipCounterElement = document.getElementById('relationship-counter');
const relationshipStartDateString = "2025-01-17T18:30:00"; // Lembre-se de ATUALIZAR esta data!

function updateRelationshipCounter() {
    if (!relationshipCounterElement) return;

    const startDate = new Date(relationshipStartDateString);
    const now = new Date();
    let diffInMilliseconds = now - startDate;

    if (diffInMilliseconds < 0) {
        relationshipCounterElement.textContent = "Nossa contagem especial começa em breve! ❤️";
        return;
    }

    let remainingMilliseconds = diffInMilliseconds;
    const daysInMs = 86400000; // 24 * 60 * 60 * 1000
    const hoursInMs = 3600000; // 60 * 60 * 1000
    const minutesInMs = 60000; // 60 * 1000
    const secondsInMs = 1000;

    const days = Math.floor(remainingMilliseconds / daysInMs);
    remainingMilliseconds %= daysInMs;
    const hours = Math.floor(remainingMilliseconds / hoursInMs);
    remainingMilliseconds %= hoursInMs;
    const minutes = Math.floor(remainingMilliseconds / minutesInMs);
    remainingMilliseconds %= minutesInMs;
    const seconds = Math.floor(remainingMilliseconds / secondsInMs);

    const pluralS = (n) => (n !== 1 ? 's' : '');
    relationshipCounterElement.innerHTML = `<span>Juntos há: </span> <strong>${days} dia${pluralS(days)}</strong>, ` +
        `<strong>${String(hours).padStart(2, '0')}h</strong> ` +
        `<strong>${String(minutes).padStart(2, '0')}m</strong> ` +
        `<strong>${String(seconds).padStart(2, '0')}s</strong> ✨`;
}

// --- LÓGICA PARA O BOTÃO "VOLTAR AO INÍCIO" ---
if (timelineContainer && backToStartBtn) {
    timelineContainer.addEventListener('scroll', () => {
        if (timelineContainer.scrollLeft > 200) {
            backToStartBtn.classList.add('visible');
        } else {
            backToStartBtn.classList.remove('visible');
        }
    });
    backToStartBtn.addEventListener('click', () => {
        timelineContainer.scrollTo({
            left: 0,
            behavior: 'smooth'
        });
    });
}

// --- INICIALIZAÇÕES AO CARREGAR A PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    renderEvents(); // Renderiza a timeline
    if (formContainer && showAddEventFormBtn) {
        hideForm();
    }

    // Inicializa o contador de relacionamento
    if (relationshipCounterElement) {
        updateRelationshipCounter();
        setInterval(updateRelationshipCounter, 1000);
    }
});