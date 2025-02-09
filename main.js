document.addEventListener('DOMContentLoaded', init);

let commandsData = [];
const sectionsOrder = [
    "System Information",
    "Process Management",
    "Disk & Filesystem",
    "Networking",
    "File & Search",
    "Permissions",
    "File Management"
];

function init() {
    loadCommandData();
    setupBackToTop();
}

function loadCommandData() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            console.log(`Loaded ${data.length} commands.`);
            commandsData = data;
            buildFeaturedList();
            buildAccordionSections();
            attachCopyHandlers();
            attachSearchHandler();
        })
        .catch(err => console.error("Failed to load data.json", err));
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function buildFeaturedList() {
    const featuredList = document.getElementById('featuredList');
    featuredList.innerHTML = "";
    let featuredCommands = (commandsData.length <= 5)
        ? commandsData
        : Array.from(new Set(Array.from({ length: 5 }, () => Math.floor(Math.random() * commandsData.length))))
            .map(index => commandsData[index]);

    featuredCommands.forEach(cmd => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" class="featured-link text-gray-400 hover:text-gray-200 transition-colors">${cmd.name}</a>`;
        li.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToCommand(cmd.name);
        });
        featuredList.appendChild(li);
    });
}

function scrollToCommand(commandName) {
    const card = document.querySelector(`[data-cmd-name="${commandName}"]`);
    if (card) {
        const accordionContent = card.closest('.accordion-content');
        if (accordionContent && accordionContent.classList.contains('hidden')) {
            accordionContent.classList.remove('hidden');
            const headerBtn = accordionContent.previousElementSibling;
            if (headerBtn) headerBtn.querySelector('.toggle-icon').textContent = '−';
        }
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("highlight");
        setTimeout(() => { card.classList.remove("highlight"); }, 2000);
    }
}

function createCommandCard(cmd) {
    const card = document.createElement('div');
    card.setAttribute("data-cmd-name", cmd.name);
    card.className = "bg-gray-700 p-4 rounded-lg shadow transition transform duration-300 hover-scale-slight animate-fadeSlide";

    let html = `
                <h3 class="text-xl font-bold text-gray-200 mb-2">${cmd.name}</h3>
                <p class="text-gray-400 mb-2">${cmd.description}</p>
                <div class="mb-2">
                    <span class="font-semibold text-gray-300">Command:</span>
                    <code class="bg-gray-800 text-green-400 px-1 rounded">${cmd.command}</code>
                </div>
                <div class="mb-4">
                    <span class="font-semibold text-gray-300">Output:</span>
                    <pre class="bg-gray-800 p-2 rounded text-sm whitespace-pre-wrap text-gray-400">${cmd.output}</pre>
                </div>
                <button class="toggle-details bg-gray-600 text-white py-1 px-3 rounded mb-2 focus:outline-none">Show Details</button>
                <div class="details hidden text-sm text-gray-400 border-t border-gray-600 pt-2">
            `;

    html += createDetailSection("Common Options", cmd.common_options);
    html += createDetailSection("Examples", cmd.examples);
    html += createDetailSection("Related Commands", cmd.related_commands);
    html += createDetailSection("Best Practices", cmd.best_practices);
    html += `</div>`;

    html += `<button data-clipboard-text="${cmd.command}" class="copy-btn bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition transform duration-200 hover:scale-105 focus:outline-none">Copy</button>`;

    card.innerHTML = html;

    const toggleButton = card.querySelector('.toggle-details');
    toggleButton.addEventListener('click', function () {
        const detailsDiv = this.nextElementSibling;
        if (detailsDiv.classList.contains('hidden')) {
            detailsDiv.classList.remove('hidden');
            this.textContent = "Hide Details";
        } else {
            detailsDiv.classList.add('hidden');
            this.textContent = "Show Details";
        }
    });

    return card;
}

function createDetailSection(title, data) {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0) || (Array.isArray(data) && data.length === 0)) {
        return "";
    }

    let sectionHTML = `<div class="mb-2"><span class="font-semibold text-gray-300">${title}:</span>`;
    if (typeof data === 'object' && !Array.isArray(data)) {
        sectionHTML += `<ul class="list-disc ml-6">`;
        for (const key in data) {
            sectionHTML += `<li><code class="bg-gray-800 px-1 rounded">${key}</code>: ${data[key]}</li>`;
        }
        sectionHTML += `</ul>`;
    } else if (Array.isArray(data)) {
        sectionHTML += `<ul class="list-disc ml-6">`;
        data.forEach(item => {
            sectionHTML += `<li><code class="bg-gray-800 px-1 rounded">${item}</code></li>`;
        });
        sectionHTML += `</ul>`;
    }

    sectionHTML += `</div>`;
    return sectionHTML;
}

function buildAccordionSections() {
    const accordion = document.getElementById('accordion');
    accordion.innerHTML = "";
    sectionsOrder.forEach(sectionName => {
        const sectionCommands = commandsData.filter(cmd => cmd.section === sectionName);
        if (sectionCommands.length > 0) {
            const sectionContainer = document.createElement('div');
            sectionContainer.className = "mb-6 animate-fadeSlide";

            const headerBtn = document.createElement('button');
            headerBtn.className = "w-full bg-gray-800 text-left px-4 py-3 rounded-t shadow hover:bg-gray-700 transition flex justify-between items-center focus:outline-none";
            headerBtn.innerHTML = `<span class="text-2xl font-bold">${sectionName}</span> <span class="toggle-icon text-2xl">+</span>`;
            headerBtn.addEventListener('click', () => {
                const contentEl = headerBtn.nextElementSibling;
                if (contentEl.classList.contains('hidden')) {
                    contentEl.classList.remove('hidden');
                    headerBtn.querySelector('.toggle-icon').textContent = '−';
                } else {
                    contentEl.classList.add('hidden');
                    headerBtn.querySelector('.toggle-icon').textContent = '+';
                }
            });

            sectionContainer.appendChild(headerBtn);

            const sectionContent = document.createElement('div');
            sectionContent.className = "accordion-content hidden border border-t-0 border-gray-700 rounded-b";

            const grid = document.createElement('div');
            grid.className = "grid grid-cols-1 md:grid-cols-2 gap-6 p-4";
            sectionCommands.forEach(cmd => {
                grid.appendChild(createCommandCard(cmd));
            });
            sectionContent.appendChild(grid);
            sectionContainer.appendChild(sectionContent);
            accordion.appendChild(sectionContainer);
        }
    });
}

function attachCopyHandlers() {
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function () {
            const text = this.getAttribute('data-clipboard-text');
            navigator.clipboard.writeText(text)
                .then(() => showToast("Copied!"))
                .catch(err => console.error("Copy failed", err));
        });
    });
}

function attachSearchHandler() {
    const searchBar = document.getElementById('searchBar');
    const noResults = document.getElementById('noResults');

    searchBar.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        let totalVisible = 0;

        document.querySelectorAll('[data-cmd-name]').forEach(card => {
            if (card.textContent.toLowerCase().includes(searchTerm)) {
                card.style.display = "";
                totalVisible++;
            } else {
                card.style.display = "none";
            }
        });

        document.querySelectorAll('#accordion > div').forEach(sectionContainer => {
            const grid = sectionContainer.querySelector('.grid');
            const sectionContent = sectionContainer.querySelector('.accordion-content');
            const headerBtn = sectionContainer.querySelector('button');

            if (grid) {
                const visibleCards = Array.from(grid.children).filter(card => card.style.display !== "none");
                if (visibleCards.length === 0) {
                    sectionContainer.style.display = "none";
                } else {
                    sectionContainer.style.display = "";
                    if (sectionContent.classList.contains('hidden')) {
                        sectionContent.classList.remove('hidden');
                        if (headerBtn) headerBtn.querySelector('.toggle-icon').textContent = '−';
                    }
                }
            }
        });

        noResults.classList.toggle('hidden', totalVisible > 0);
    });
}

function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
            backToTopBtn.classList.remove('hidden');
        } else {
            backToTopBtn.classList.add('hidden');
        }
    });
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadCommandData();
});
