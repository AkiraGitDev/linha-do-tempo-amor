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
        localStorage.removeItem('timelineEvents');
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
    if (formContainer) formContainer.style.display = 'block';
    if (showAddEventFormBtn) showAddEventFormBtn.style.display = 'none';
    if (eventDateInput) eventDateInput.focus();
}

function hideForm() {
    if (formContainer) formContainer.style.display = 'none';
    if (showAddEventFormBtn) showAddEventFormBtn.style.display = 'block';
    if (form) form.reset();
    if (eventImageInput) eventImageInput.value = '';
}

// Event Listeners para os botões de mostrar/esconder formulário
if (showAddEventFormBtn && formContainer && cancelAddEventBtn && form && eventDateInput && eventImageInput) {
    showAddEventFormBtn.addEventListener('click', showForm);
    cancelAddEventBtn.addEventListener('click', hideForm);
}

// Criar elemento de evento na timeline
function createEventElement(event) {
    const eventElem = document.createElement('div');
    eventElem.classList.add('timeline-event');
    eventElem.classList.add('event-card-appear');
    eventElem.setAttribute('data-category', event.category);
    eventElem.id = `event-${event.id}`;

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('event-category-icon');
    iconSpan.textContent = categoryIcons[event.category] || '⭐';

    const eventDateElem = document.createElement('div');
    eventDateElem.classList.add('event-date');
    eventDateElem.textContent = formatDate(event.date);

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '&times;';
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

    const exportBtn = document.createElement('button');
    exportBtn.classList.add('export-image-btn');
    exportBtn.innerHTML = '🖼️';
    exportBtn.title = 'Baixar como Imagem';
    exportBtn.onclick = () => {
        exportEventAsImage(eventElem.id, event.desc);
    };

    const eventDescElem = document.createElement('div');
    eventDescElem.classList.add('event-desc');
    eventDescElem.textContent = event.desc;

    eventElem.appendChild(iconSpan);
    eventElem.appendChild(eventDateElem);
    eventElem.appendChild(deleteBtn);
    eventElem.appendChild(editBtn);
    eventElem.appendChild(exportBtn);
    eventElem.appendChild(eventDescElem);

    if (event.image) {
        const imgElem = document.createElement('img');
        imgElem.classList.add('event-image');
        imgElem.src = event.image;
        imgElem.alt = 'Imagem do evento';
        eventElem.appendChild(imgElem);
    }

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
            deleteCommentBtn.title = 'Apagar observação';
            deleteCommentBtn.onclick = () => {
                if (confirm(`Apagar a observação: "${commentText.substring(0, 30)}..."?`)) {
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
    addCommentBtn.textContent = '💬 Adicionar Observação';
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
    if (!timeline) return;
    timeline.innerHTML = '';
    const events = loadEvents();
    const selectedCategory = filterCategory ? filterCategory.value : 'all';
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

if (filterCategory) {
    filterCategory.addEventListener('change', renderEvents);
}

// Apagar evento pelo ID
function deleteEvent(id) {
    const elemToDelete = document.getElementById(`event-${id}`);

    if (elemToDelete) {
        elemToDelete.classList.add('event-card-disappear');
        elemToDelete.addEventListener('animationend', () => {
            let events = loadEvents();
            events = events.filter(event => event.id !== id);
            saveEvents(events);
            renderEvents();
        }, { once: true });
    } else {
        let events = loadEvents();
        events = events.filter(event => event.id !== id);
        saveEvents(events);
        renderEvents();
    }
}

// Adicionar novo evento (EventListener do formulário)
if (form && eventDateInput && eventDescInput && eventCategoryInput && eventImageInput) {
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
}

// Função para adicionar evento ao localStorage
function addEventToStorage(date, desc, category, image) {
    const events = loadEvents();
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    events.push({ id, date, desc, category, image, comments: [] });
    saveEvents(events);
    renderEvents();
    hideForm();
}

// Função para adicionar um comentário
function addCommentToEvent(eventId, commentText) {
    const events = loadEvents();
    const eventIndex = events.findIndex(event => event.id === eventId);
    if (eventIndex > -1) {
        if (!events[eventIndex].comments) events[eventIndex].comments = [];
        events[eventIndex].comments.push(commentText);
        saveEvents(events);
        renderEvents();
    }
}

// Função para deletar um comentário
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
            console.error("Índice de comentário inválido.");
        }
    } else {
        console.error("Evento não encontrado para deletar comentário.");
    }
}

// Função para exportar evento como imagem
function exportEventAsImage(elementId, eventDescription) {
    const elementToCapture = document.getElementById(elementId);
    if (!elementToCapture) {
        console.error("Elemento para captura não encontrado:", elementId);
        alert("Erro ao encontrar o evento para exportar.");
        return;
    }
    elementToCapture.classList.add('capturing-for-export'); // Classe temporária

    // Certifique-se que a biblioteca html2canvas está carregada
    if (typeof html2canvas === 'undefined') {
        alert('Erro: A biblioteca html2canvas não foi carregada.');
        elementToCapture.classList.remove('capturing-for-export');
        return;
    }

    html2canvas(elementToCapture, {
        useCORS: true,
        logging: false,
        backgroundColor: '#fde7f0' // Força um fundo, caso o do elemento não seja capturado
        // scale: window.devicePixelRatio // Pode melhorar a qualidade em telas de alta densidade
    }).then(canvas => {
        elementToCapture.classList.remove('capturing-for-export');
        const link = document.createElement('a');
        let filename = "evento_timeline"; // Nome padrão
        if (eventDescription) {
            filename = eventDescription.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
            if (!filename) filename = 'evento'; // Fallback se a descrição sanitizada for vazia
        }
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(error => {
        elementToCapture.classList.remove('capturing-for-export');
        console.error('Erro ao usar html2canvas:', error);
        alert('Desculpe, ocorreu um erro ao tentar exportar a imagem.');
    });
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
    if (!eventToEdit || !editModal || !editDate || !editDesc || !editCategoryModal || !editImage) return;
    currentEditEventId = id;
    editDate.value = eventToEdit.date;
    editDesc.value = eventToEdit.desc;
    editCategoryModal.value = eventToEdit.category;
    editImage.value = '';
    editModal.style.display = 'flex';
}

if (editCancelBtn && editModal) {
    editCancelBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
        currentEditEventId = null;
    });
}

if (editForm && editDate && editDesc && editCategoryModal && editImage) {
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentEditEventId) return;
        const imageFile = editImage?.files[0] || null;
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function (evt) { updateEventInStorage(evt.target.result); };
            reader.onerror = function () { alert('Erro ao ler a nova imagem para edição.'); };
            reader.readAsDataURL(imageFile);
        } else {
            updateEventInStorage(null);
        }
    });
}

function updateEventInStorage(newBase64Image) {
    if (!currentEditEventId || !editDate || !editDesc || !editCategoryModal) return;
    let events = loadEvents();
    const eventIndex = events.findIndex(ev => ev.id === currentEditEventId);
    if (eventIndex === -1) return;
    events[eventIndex].date = editDate.value;
    events[eventIndex].desc = editDesc.value.trim();
    events[eventIndex].category = editCategoryModal.value;
    if (newBase64Image) events[eventIndex].image = newBase64Image;
    saveEvents(events);
    renderEvents();
    if (editModal) editModal.style.display = 'none';
    currentEditEventId = null;
}

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
const relationshipStartDateString = "2025-01-17T08:30:00";

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
    const days = Math.floor(remainingMilliseconds / 86400000); remainingMilliseconds %= 86400000;
    const hours = Math.floor(remainingMilliseconds / 3600000); remainingMilliseconds %= 3600000;
    const minutes = Math.floor(remainingMilliseconds / 60000); remainingMilliseconds %= 60000;
    const seconds = Math.floor(remainingMilliseconds / 1000);
    const pluralS = (n) => (n !== 1 ? 's' : '');
    relationshipCounterElement.innerHTML = `<span>Juntos há: </span> <strong>${days} dia${pluralS(days)}</strong>, ` +
        `<strong>${String(hours).padStart(2, '0')}h</strong> ` +
        `<strong>${String(minutes).padStart(2, '0')}m</strong> ` +
        `<strong>${String(seconds).padStart(2, '0')}s</strong> ✨`;
}

// --- LÓGICA PARA O BOTÃO "VOLTAR AO INÍCIO" ---
if (timelineContainer && backToStartBtn) {
    timelineContainer.addEventListener('scroll', () => {
        if (timelineContainer.scrollLeft > 200) backToStartBtn.classList.add('visible');
        else backToStartBtn.classList.remove('visible');
    });
    backToStartBtn.addEventListener('click', () => {
        timelineContainer.scrollTo({ left: 0, behavior: 'smooth' });
    });
}

// --- INICIALIZAÇÕES AO CARREGAR A PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    renderEvents();
    if (formContainer && showAddEventFormBtn) hideForm(); // Garante que o formulário de adicionar comece escondido

    if (relationshipCounterElement) {
        updateRelationshipCounter(); // Primeira chamada
        setInterval(updateRelationshipCounter, 1000); // Atualiza a cada segundo
    }
});