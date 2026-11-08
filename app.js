const sourceJson = `{
  "event": {
    "title": "Ночь в музее",
    "date": "15 ноября, 18:30",
    "place": "Музей космонавтики, проспект Мира, 111",
    "description": "Вечерняя программа с выставкой и экскурсиями",
    "meeting": "Сбор: 18:30. Начало: 19:00."
  },
  "services": [
    { "id": "guide", "title": "  Экскурсия с гидом  ", "price": 500 },
    { "id": "audio", "title": "Аудиогид", "price": 350 },
    { "id": "catalog", "title": "Каталог выставки", "price": 250 }
  ]
}`;

// Функция расчета отчета по выбранным услугам (согласно ТЗ)
function buildReport(services, guideChecked, audioChecked, catalogChecked) {
    // 1. Отбор услуг через filter
    const filteredServices = services.filter(function(service) {
        if (service.id === 'guide') return guideChecked;
        if (service.id === 'audio') return audioChecked;
        if (service.id === 'catalog') return catalogChecked;
        return false;
    });

    // 2. Создание нового массива объектов через map с одноуровневой деструктуризацией и trim()
    const items = filteredServices.map(function(service) {
        const { title, price } = service;
        return {
            title: title.trim(),
            price: price
        };
    });

    // 3. Подсчет суммы через reduce
    const total = items.reduce(function(sum, item) {
        return sum + item.price;
    }, 0);

    return {
        count: items.length,
        total: total,
        items: items
    };
}

// Нахождение всех необходимых DOM-элементов интерфейса по их ID
const eventTitle = document.querySelector('#event-title');
const eventDate = document.querySelector('#event-date');
const eventPlace = document.querySelector('#event-place');
const eventDescription = document.querySelector('#event-description');
const showProgramBtn = document.querySelector('#show-program');
const programBlock = document.querySelector('#program');
const serviceForm = document.querySelector('#service-form');
const dataError = document.querySelector('#data-error');
const choiceError = document.querySelector('#choice-error');
const resultBlock = document.querySelector('#result');
const reportJsonBlock = document.querySelector('#report-json');

const labelGuide = document.querySelector('#label-guide');
const labelAudio = document.querySelector('#label-audio');
const labelCatalog = document.querySelector('#label-catalog');

const guideCheckbox = document.querySelector('#guide');
const audioCheckbox = document.querySelector('#audio');
const catalogCheckbox = document.querySelector('#catalog');

let data = null;

// Безопасный разбор JSON в конструкции try...catch
try {
    data = JSON.parse(sourceJson);

    // Заполнение текстовых полей карточки события
    eventTitle.textContent = data.event.title;
    eventDate.textContent = data.event.date;
    eventPlace.textContent = data.event.place;
    eventDescription.textContent = data.event.description;

    // Интеграция названий и цен услуг в соответствующие чекбоксы
    data.services.forEach(function(service) {
        const cleanTitle = service.title.trim();
        if (service.id === 'guide') labelGuide.textContent = cleanTitle + ' (' + service.price + ' руб.)';
        if (service.id === 'audio') labelAudio.textContent = cleanTitle + ' (' + service.price + ' руб.)';
        if (service.id === 'catalog') labelCatalog.textContent = cleanTitle + ' (' + service.price + ' руб.)';
    });

    // Показываем форму, так как данные распарсились успешно
    serviceForm.hidden = false;

} catch (e) {
    // При ошибке парсинга скрываем форму и выводим ошибку данных в data-error
    dataError.hidden = false;
    serviceForm.hidden = true;
}

// Передача обработчика клика в addEventListener без вызова
showProgramBtn.addEventListener('click', function() {
    if (data) {
        programBlock.innerHTML = data.event.meeting;
        programBlock.hidden = false;
    }
});

// Передача обработчика отправки формы расчета в addEventListener без вызова
serviceForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Предотвращаем перезагрузку страницы

    // Чтение свойств checked у чекбоксов
    const guideChecked = guideCheckbox.checked;
    const audioChecked = audioCheckbox.checked;
    const catalogChecked = catalogCheckbox.checked;

    // Валидация на пустой выбор
    if (!guideChecked && !audioChecked && !catalogChecked) {
        choiceError.hidden = false;
        resultBlock.hidden = true;
        reportJsonBlock.hidden = true;
        return;
    }

    // Скрываем ошибку выбора, если хоть один чекбокс активен
    choiceError.hidden = true;

    // Вызов функции генерации отчета
    const report = buildReport(data.services, guideChecked, audioChecked, catalogChecked);

    // Формирование innerHTML строки для вывода результата по ТЗ
    let resultHtml = 'Выбрано услуг: ' + report.count + '<br>Итого: ' + report.total + ' руб.';
    report.items.forEach(function(item) {
        resultHtml += '<br>' + item.title;
    });
    
    resultBlock.innerHTML = resultHtml;
    resultBlock.hidden = false;

    // Перевод отчета в строку, проверка через JSON.parse() и вывод в report-json
    const jsonString = JSON.stringify(report);
    try {
        JSON.parse(jsonString); 
        reportJsonBlock.textContent = jsonString;
        reportJsonBlock.hidden = false;
    } catch (jsonErr) {
        reportJsonBlock.hidden = true;
    }
});
