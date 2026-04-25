document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
});

function animateNameFromSymbols(element, finalText) {
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    const chars = finalText.split('');
    const iterations = 20; // Number of frames for the animation
    let frame = 0;

    // Create an array to track when each character should be revealed
    const revealFrame = chars.map((_, index) => Math.floor(iterations * 0.3) + index * 2);

    const interval = setInterval(() => {
        element.textContent = chars
            .map((char, index) => {
                if (char === ' ') return ' '; // Keep spaces

                // If we've reached the reveal frame for this character, show it
                if (frame >= revealFrame[index]) {
                    return char;
                }

                // Otherwise show a random symbol
                return symbols[Math.floor(Math.random() * symbols.length)];
            })
            .join('');

        frame++;

        // Stop when all characters are revealed
        if (frame >= iterations) {
            clearInterval(interval);
            element.textContent = finalText; // Ensure final text is correct
        }
    }, 120); // Update every 80ms
}

async function loadAllData() {
    try {
        const [dataRes, eduRes, projRes] = await Promise.all([
            fetch('data.json'),
            fetch('education.json'),
            fetch('projects.json')
        ]);

        const data = await dataRes.json();
        const education = await eduRes.json();
        const projects = await projRes.json();

        // Populate Header with symbol-to-letter animation
        const nameElement = document.getElementById('name');
        animateNameFromSymbols(nameElement, data.name || '');
        document.getElementById('bio').textContent = data.bio || '';

        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        nameElement.parentNode.insertBefore(cursor, nameElement.nextSibling);


        // Populate About
        document.getElementById('about-content').textContent = data.about || '';

        // Populate Education
        const eduContainer = document.getElementById('education-content');
        let eduHTML = '';
        if (education.formal) {
            education.formal.forEach(e => {
                eduHTML += `<div class="edu-entry"><strong>${e.degree}</strong>, ${e.institution} (${e.start}–${e.end})</div>`;
            });
        }
        if (education.side_quests) {
            eduHTML += '<br><h3>Side Quests</h3>';
            education.side_quests.forEach(s => {
                eduHTML += `<div class="side-entry"><strong>${s.title}</strong> — ${s.organizer}</div>`;
            });
        }
        eduContainer.innerHTML = eduHTML;

        // Populate Projects
const projectsContainer = document.getElementById('projects-content');
projectsContainer.innerHTML = '';

for (const p of projects) {
    const projectDiv = document.createElement('div');
    projectDiv.className = 'project';

    const projectHeader = document.createElement('h3');
    projectHeader.innerHTML = `${p.title} <span class="icon"></span>`;

    const projectContent = document.createElement('div');
    projectContent.className = 'project-content';
    projectContent.style.display = 'none';

    projectHeader.addEventListener('click', () => {
        projectHeader.classList.toggle('active');
        projectContent.style.display =
            projectContent.style.display === 'block' ? 'none' : 'block';
    });

    let contentHTML = `<p>${p.description || ''}</p>`;

    // Safe markdown loading
    if (p.file) {
        try {
            const mdRes = await fetch(`projects/${p.file}`);
            if (mdRes.ok) {
                const md = await mdRes.text();
                contentHTML += `<div>${marked.parse(md)}</div>`;
            }
        } catch (err) {
            console.warn(`Could not load ${p.file}`);
        }
    }

    // Links
    if (p.links) {
        contentHTML += '<div class="links">';
        for (const [label, url] of Object.entries(p.links)) {
            contentHTML += `<a href="${url}" target="_blank">${label}</a>`;
        }
        contentHTML += '</div>';
    }

    projectContent.innerHTML = contentHTML;

    projectDiv.appendChild(projectHeader);
    projectDiv.appendChild(projectContent);
    projectsContainer.appendChild(projectDiv);
}
