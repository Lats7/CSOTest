document.addEventListener('DOMContentLoaded', () => {
    loadSavedPaths();
    showList('windows'); // Show Windows paths by default
});

function showList(os) {
    document.querySelectorAll('.list').forEach(list => {
        list.style.display = 'none';
    });
    document.getElementById(os).style.display = 'block';
}

function addPath() {
    const path = document.getElementById('newPath').value.trim();
    const os = document.getElementById('osSelect').value;
    if (path) {
        savePath(path, os);
        document.getElementById('newPath').value = ''; // Clear the input field after adding
    }
}

function savePath(path, os) {
    fetch('https://<your-function-app-name>.azurewebsites.net/api/addPath', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: path, os: os })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Path added:', data);
        loadSavedPaths(); // Refresh the displayed list after adding
    })
    .catch(error => console.error('Failed to add path:', error));
}

function loadSavedPaths() {
    fetch('https://<your-function-app-name>.azurewebsites.net/api/getPaths')
    .then(response => response.json())
    .then(data => updateUI(data))
    .catch(error => console.error('Failed to load paths:', error));
}

function updateUI(paths) {
    document.querySelectorAll('.list ul').forEach(ul => ul.innerHTML = ''); // Clear existing lists

    Object.keys(paths).forEach(os => {
        const list = document.getElementById(os).querySelector('ul');
        paths[os].forEach(path => {
            const li = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'path-checkbox';
            checkbox.dataset.os = os;
            checkbox.dataset.path = path;

            const textNode = document.createTextNode(` ${path}`);
            li.appendChild(checkbox);
            li.appendChild(textNode);
            list.appendChild(li);
        });
    });
}

function deleteSelectedPaths() {
    const checkboxes = document.querySelectorAll('.path-checkbox:checked');
    checkboxes.forEach(checkbox => {
        const os = checkbox.dataset.os;
        const path = checkbox.dataset.path;

        fetch('https://<your-function-app-name>.azurewebsites.net/api/deletePath', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ os: os, path: path })
        })
        .then(() => {
            loadSavedPaths(); // Refresh the displayed list after deletion
        })
        .catch(error => console.error('Failed to delete path:', error));
    });
}
