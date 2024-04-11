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
    const paths = JSON.parse(localStorage.getItem('paths')) || {};
    if (!paths[os]) paths[os] = [];
    if (!paths[os].includes(path)) { // Avoid duplicate paths
        paths[os].push(path);
        localStorage.setItem('paths', JSON.stringify(paths)); // Update localStorage
        updateUI(); // Refresh the displayed list
    }
}

function loadSavedPaths() {
    updateUI();
}

function updateUI() {
    const paths = JSON.parse(localStorage.getItem('paths')) || {};
    document.querySelectorAll('.list ul').forEach(ul => ul.innerHTML = ''); // Clear existing lists
    
    Object.keys(paths).forEach(os => {
        const list = document.getElementById(os).querySelector('ul');
        paths[os].forEach((path, index) => {
            const li = document.createElement('li');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'path-checkbox';
            checkbox.dataset.os = os;
            checkbox.dataset.index = index;

            const textNode = document.createTextNode(` ${path}`);
            li.appendChild(checkbox);
            li.appendChild(textNode);
            list.appendChild(li);
        });
    });
}

function deleteSelectedPaths() {
    const paths = JSON.parse(localStorage.getItem('paths')) || {};
    document.querySelectorAll('.path-checkbox:checked').forEach(checkbox => {
        const os = checkbox.dataset.os;
        const index = parseInt(checkbox.dataset.index, 10);
        paths[os].splice(index, 1); // Remove the path based on index
    });

    // Clean up any empty arrays
    Object.keys(paths).forEach(os => {
        if (!paths[os].length) delete paths[os];
    });

    localStorage.setItem('paths', JSON.stringify(paths)); // Update localStorage
    updateUI(); // Refresh the displayed list
}

