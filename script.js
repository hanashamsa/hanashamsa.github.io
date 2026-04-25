document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
});

function animateNameFromSymbols(element, finalText) {
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    const chars = finalText.split('');
    const iterations = 20;
    let frame = 0;

    const revealFrame = chars.map((_, index) =>
        Math.floor(iterations * 0.3) + index * 2
    );

    const interval = setInterval(() => {
        element.textContent = chars
            .map((char, index) => {
                if (char === ' ') return ' ';
                if (frame >= revealFrame[index]) return char;

                return symbols[Math.floor(Math.random() * symbols.length)];
            })
            .join('');

        frame++;

        if (frame >= iterations) {
            clearInterval(interval);
            element.textContent = finalText;
        }
    }, 120);
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

        // HEADER
        const nameElement = document.getElementById('name');
        animateNameFromSymbols(nameElement, data.name || '');
        document.getElementById('bio').textContent = data.bio || '';

        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        nameElement.parentNode.insertBefore(cursor, nameElement.nextSibling);

        // ABOUT
        document.getElementById('about-content').textContent =
            data.about || '';

        // EDUCATION
        const eduContainer = document.getElementById('education-content');
        let eduHTML = '';

        if (education.formal) {
            education.formal.forEach(e => {
                eduHTML += `
                    <div class="edu-entry">
                        <strong>${e.degree}</strong>,
                        ${e.institution}
                        (${e.start}–${e.end})
                    </div>
                `;
            });
        }

        if (education.side_quests) {
            eduHTML += '<br><h3>Side Quests</h3>';

            education.side_quests.forEach(s => {
                eduHTML += `
                    <div class="side-entry">
                        <strong>${s.title}</strong> — ${s.organizer}
                    </div>
                `;
            });
        }

        eduContainer.innerHTML = eduHTML;

        // PROJECTS
        const projectsContainer =
            document.getElementById('projects-content');

        projectsContainer.innerHTML = '';

        console.log("Projects Loaded:", projects.length);

        for (const p of projects) {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'project';

            const projectHeader = document.createElement('h3');
            projectHeader.innerHTML =
                `${p.title} <span class="icon"></span>`;

            const projectContent =
                document.createElement('div');

            projectContent.className = 'project-content';
            projectContent.style.display = 'none';

            projectHeader.addEventListener('click', () => {
                projectHeader.classList.toggle('active');

                projectContent.style.display =
                    projectContent.style.display === 'block'
                        ? 'none'
                        : 'block';
            });

            let contentHTML =
                `<p>${p.description || ''}</p>`;

            // SAFE MARKDOWN LOAD
            if (p.file) {
                try {
                    const mdRes = await fetch(`projects/${p.file}`);

                    if (mdRes.ok) {
                        const md = await mdRes.text();
                        contentHTML +=
                            `<div>${marked.parse(md)}</div>`;
                    } else {
                        console.warn(
                            `Markdown file not found: ${p.file}`
                        );
                    }
                } catch (err) {
                    console.warn(
                        `Error loading markdown: ${p.file}`,
                        err
                    );
                }
            }

            // LINKS
            if (p.links) {
                contentHTML += '<div class="links">';

                for (const [label, url] of Object.entries(p.links)) {
                    contentHTML += `
                        <a href="${url}" target="_blank">
                            ${label}
                        </a>
                    `;
                }

                contentHTML += '</div>';
            }

            projectContent.innerHTML = contentHTML;

            projectDiv.appendChild(projectHeader);
            projectDiv.appendChild(projectContent);

            projectsContainer.appendChild(projectDiv);
        }

        // CONTACT
        const contactContainer =
            document.getElementById('contact-content');

        let contactHTML = '';

        if (data.email) {
            contactHTML += `
                <div>
                    <a href="mailto:${data.email}">
                        ${data.email}
                    </a>
                </div>
            `;
        }

        if (data.socials) {
            for (const [name, url] of Object.entries(data.socials)) {
                contactHTML += `
                    <div>
                        <a href="${url}" target="_blank">
                            ${name}
                        </a>
                    </div>
                `;
            }
        }

        contactContainer.innerHTML = contactHTML;

    } catch (error) {
        console.error('Error loading data:', error);
    }
}
