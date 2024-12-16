console.log('Popup script loaded'); // Debugging line

document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveButton');
    const urlInput = document.getElementById('urlInput');
    const urlList = document.getElementById('urlList');

    // Load saved URLs
    chrome.storage.sync.get('urls', (data) => {
        const urls = data.urls || [];
        urls.forEach(url => addUrlToList(url));
    });

    // Save URL
    saveButton.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (isValidUrl(url)) {
            chrome.storage.sync.get('urls', (data) => {
                const urls = data.urls || [];
                if (!urls.includes(url)) {  // Prevent duplicates
                    urls.push(url);
                    chrome.storage.sync.set({ urls }, () => {
                        addUrlToList(url);
                        urlInput.value = '';  // Clear the input field
                    });
                } else {
                    alert('This URL is already saved.');
                }
            });
        } else {
            alert('Please enter a valid URL.');
        }
    });

    // Function to validate URL
    function isValidUrl(url) {
        const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z0-9]+([a-z0-9-]*[a-z0-9]+)?)\\.)+[a-z]{2,}|' + // domain name
            'localhost|' + // localhost
            '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|' + // IP address
            '\\[?[a-f0-9]*:[a-f0-9:%.]*\\])' + // IPv6
            '(\\:\\d+)?(\\/[-a-z0-9+&@#/%=~_|$?!:.]*[^\\s]*)?$', 'i'); // path
        return !!pattern.test(url);
    }

    // Function to add URL to the list
    function addUrlToList(url) {
        const li = document.createElement('li');
        li.textContent = url;

        // Create Edit Button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'editButton';
        editButton.onclick = () => editUrl(url, li);

        // Create Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'deleteButton';
        deleteButton.onclick = () => deleteUrl(url, li);

        li.appendChild(editButton);
        li.appendChild(deleteButton);
        urlList.appendChild(li);
    }

    // Function to edit URL
    function editUrl(oldUrl, li) {
        const newUrl = prompt('Edit URL:', oldUrl);
        if (newUrl && isValidUrl(newUrl)) {
            chrome.storage.sync.get('urls', (data) => {
                let urls = data.urls || [];
                const index = urls.indexOf(oldUrl);
                if (index !== -1) {
                    // Update the URL in the array
                    urls[index] = newUrl;
                    chrome.storage.sync.set({ urls }, () => {
                        li.firstChild.nodeValue = newUrl; // Update displayed URL
                    });
                }
            });
        } else if (newUrl) {
            alert('Please enter a valid URL.');
        }
    }

    // Function to delete URL
    function deleteUrl(url, li) {
        chrome.storage.sync.get('urls', (data) => {
            let urls = data.urls || [];
            const index = urls.indexOf(url);
            if (index !== -1) {
                urls.splice(index, 1); // Remove the URL
                chrome.storage.sync.set({ urls }, () => {
                    urlList.removeChild(li); // Remove from displayed list
                });
            }
        });
    }
});
