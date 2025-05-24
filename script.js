// Initialize Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Maximize the Web App view

// Get user ID from URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');

// DOM Elements
const loader = document.getElementById('loader');
const groupsList = document.getElementById('groups-list');
const errorDiv = document.getElementById('error');

// Fetch groups from backend
async function loadGroups() {
    try {
        const response = await fetch(`https://your-backend.com/api/groups?user_id=${userId}`);
        const groups = await response.json();

        if (groups.length === 0) {
            showError("No eligible groups found.");
            return;
        }

        renderGroups(groups);
    } catch (err) {
        showError("Failed to load groups. Try again later.");
    }
}

// Display groups in list
function renderGroups(groups) {
    loader.classList.add('hidden');
    groupsList.classList.remove('hidden');

    groups.forEach(group => {
        const groupElement = document.createElement('div');
        groupElement.className = 'group-item';
        groupElement.innerHTML = `
            <span class="group-name">${group.title}</span>
            <span class="group-members">${group.members_count} members</span>
        `;

        groupElement.addEventListener('click', () => {
            tg.sendData(JSON.stringify({
                group_id: group.id,
                group_title: group.title
            }));
            tg.close();
        });

        groupsList.appendChild(groupElement);
    });
}

// Show error message
function showError(message) {
    loader.classList.add('hidden');
    errorDiv.classList.remove('hidden');
    errorDiv.textContent = message;
}

// Start loading groups when page loads
document.addEventListener('DOMContentLoaded', loadGroups);
