// Сохранение данных в LocalStorage и отправка на сервер
async function saveData(showAlert = false) {
    const rows = document.querySelectorAll('tbody tr');
    const feedbackData = [];

    // Собираем данные из всех строк
    rows.forEach((row) => {
        const subject = row.querySelector('.subject').textContent;
        const checkboxes = row.querySelectorAll('input[type="checkbox"]');
        const textInput = row.querySelector('input[type="text"]');

        const rowData = {
            subject: subject,
            bangladesh: checkboxes[0].checked,
            train: checkboxes[1].checked,
            women: checkboxes[2].checked,
            snacks: checkboxes[3].checked,
            home: checkboxes[4].checked,
            custom_text: textInput.value
        };
        
        feedbackData.push(rowData);
    });

    // Сохраняем в LocalStorage
    localStorage.setItem('feedbackData', JSON.stringify(feedbackData));
    
    // Отправляем на сервер
    try {
        for (const data of feedbackData) {
            const response = await fetch('http://localhost:3000/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (!result.success) {
                console.error('Error saving to server:', result.error);
            }
        }
        
        if (showAlert) {
            alert('Andmed salvestatud kohalikult ja serverisse!');
        }
    } catch (error) {
        console.error('Error sending to server:', error);
        if (showAlert) {
            alert('Andmed salvestatud kohalikult, kuid serveriga ühendus ebaõnnestus');
        }
    }
}

// Загрузка данных из LocalStorage
function loadData() {
    const savedData = localStorage.getItem('feedbackData');
    if (savedData) {
        const data = JSON.parse(savedData);
        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach((row, index) => {
            if (data[index]) {
                const checkboxes = row.querySelectorAll('input[type="checkbox"]');
                const textInput = row.querySelector('input[type="text"]');
                
                checkboxes[0].checked = data[index].bangladesh;
                checkboxes[1].checked = data[index].train;
                checkboxes[2].checked = data[index].women;
                checkboxes[3].checked = data[index].snacks;
                checkboxes[4].checked = data[index].home;
                textInput.value = data[index].custom_text || '';
            }
        });
    }
}

// Автосохранение при изменении данных БЕЗ оповещения
function setupAutoSave() {
    const inputs = document.querySelectorAll('input[type="checkbox"], input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            saveData(false);
        });
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    const feedbackBtn = document.querySelector('.feedback-btn');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', function() {
            saveData(true);
        });
    }
    loadData();
    setupAutoSave();
});