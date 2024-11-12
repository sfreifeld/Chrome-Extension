document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name');
    const formalitySlider = document.getElementById('formalitySlider');
    const sliderValue = document.getElementById('sliderValue');
    const editSaveButton = document.getElementById('editSaveButton');
  
    // Load saved settings


    chrome.storage.sync.get(['formalityLevel', 'userName'], (data) => {
      if (data.userName) nameInput.value = data.userName;
      if (data.formalityLevel) {
        formalitySlider.value = data.formalityLevel;
      }
    });
  
    // Update slider value display
    formalitySlider.addEventListener('input', () => {
      sliderValue.textContent = formalitySlider.value;
    });

  
    // Toggle Edit/Save mode
    editSaveButton.addEventListener('click', () => {
      if (editSaveButton.textContent === 'Edit') {
        // Switch to edit mode
        nameInput.disabled = false;
        formalitySlider.disabled = false;
        nameInput.classList.remove('disabled');
        formalitySlider.classList.remove('disabled');
        editSaveButton.textContent = 'Save';
      } else {
        // Save settings and switch to view mode
        chrome.storage.sync.set({
          userName: nameInput.value,
          formalityLevel: formalitySlider.value
        }, () => {
          alert('Settings saved!');
          nameInput.disabled = true;
          formalitySlider.disabled = true;
          nameInput.classList.add('disabled');
          formalitySlider.classList.add('disabled');
          editSaveButton.textContent = 'Edit';
        });
      }
    });

    document.getElementById('shortcutLink').addEventListener('click', () => {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });
  });
  