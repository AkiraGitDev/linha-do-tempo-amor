# 💖 Nossa Jornada Digital: Uma Linha do Tempo de Amor ✨

Este projeto é uma linha do tempo interativa e pessoal, criada com carinho para celebrar e registrar os momentos especiais do nosso relacionamento. Uma aplicação web desenvolvida para guardar nossas memórias de forma única e acessível.

## 🌟 Sobre Este Cantinho Especial

Esta linha do tempo foi pensada como um presente: um espaço digital onde podemos adicionar, revisitar e valorizar cada passo da nossa história juntos. É construída com tecnologias web front-end, armazenando todos os nossos momentos diretamente no navegador para uma experiência pessoal e rápida.

## ✨ Funcionalidades Implementadas:

* **Linha do Tempo Visual e Interativa:** Navegue horizontalmente por todos os nossos eventos, dispostos cronologicamente.
* **Adicionar Nossas Memórias:** Um formulário dedicado (que surge ao clicar em "✨ Adicionar Novo Momento ✨") permite registrar novas lembranças com:
    * Data
    * Descrição detalhada
    * Categoria (com ícones temáticos como ❤️, 🎂, ✈️, 🎉, ⭐)
    * Upload de uma imagem especial para o momento.
* **Gerenciamento de Eventos:**
    * **Editar:** Modifique qualquer detalhe de um evento já criado através de um modal de edição.
    * **Apagar:** Remova eventos, com uma confirmação para evitar acidentes.
* **Filtrar por Categoria:** Encontre facilmente os momentos que procura selecionando a categoria desejada.
* **Observações e Comentários:** Adicione pequenas notas ou lembranças textuais a cada evento. Cada observação pode ser apagada individualmente.
* **Exportar Momento como Imagem:** Cada card de evento pode ser baixado como uma imagem PNG, perfeito para guardar ou compartilhar. (Utiliza a biblioteca `html2canvas`).
* **Contador do Nosso Tempo Juntos:** Um contador no rodapé da página exibe em tempo real há quantos dias, horas, minutos e segundos estamos construindo esta história (configurado para iniciar em `17/01/2025` - *esta data pode ser ajustada no código!*).
* **Navegação Facilitada:**
    * Um botão "⇤ Início" permite rolar suavemente de volta para o começo da linha do tempo.
    * Animações sutis na adição e remoção de eventos, e feedback visual em botões, para uma experiência mais agradável.

## 🚀 Como Usar e Reviver Nossos Momentos:

* **Acesse o link:** `[SEU_LINK_AQUI, ex: seunome.github.io/nomedoprojeto/]` (Se você hospedar no GitHub Pages ou similar).
* **Para rodar localmente:** Baixe os arquivos (`index.html`, `styles.css`, `script.js`) e abra o `index.html` em seu navegador.
* **Interaja:** Use os botões e filtros para navegar, adicionar, editar ou exportar suas memórias.

## 🛠️ Tecnologias por Trás da Magia:

* **HTML5:** Para a estrutura semântica da nossa linha do tempo.
* **CSS3:** Para toda a estilização, layout (incluindo Flexbox) e animações.
* **JavaScript (Vanilla JS):** Responsável por toda a interatividade, lógica de manipulação de eventos, gerenciamento de dados com o `localStorage` e interações com o DOM.
* **`localStorage` API:** Para garantir que nossas memórias fiquem salvas no seu navegador.
* **`FileReader` API:** Para o upload e visualização de imagens.
* **`html2canvas`:** Biblioteca externa (via CDN) para a funcionalidade de exportar os cards de evento como imagem.
