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

// Функция расчета отчета по выбранным услугам
function buildReport(services, guideChecked, audioChecked, catalogChecked) {
    // 1. Используем filter для отбора услуг на основе переданных флагов
    const filteredServices = services.filter(function(service) {
        if (service.id === 'guide') return guideChecked;
        if (service.id === 'audio') return audioChecked;
        if (service.id === 'catalog') return catalogChecked;
        return false;
    });

    // 2. Используем map для создания нового массива объектов с деструктуризацией и очисткой trim()
    const items = filteredServices.map(function(service) {
        const { title, price } = service;
        return {
            title: title.trim(),
            price: price
        };
    });

    // 3. Считаем сумму через reduce
    const total = items.reduce(function(sum, item) {
        return sum + item.price;
    }, 0);

    // Возвращаем объект отчета
    return {
        count: items.length,
        total: total,
        items: items
    };
}

// Переменная для хранения распарсенных данных
let data = null;

// Находим элементы интерфейса через querySelector по id
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

// Безопасный парсинг JSON в try...catch
try {
    data = JSON.parse(sourceJson);

    // Заполнение данных о событии в карточке
    eventTitle.textContent = data.event.title;
    eventDate.textContent = data.event.date;
    eventPlace.textContent = data.event.place;
    eventDescription.textContent = data.event.description;

    // Динамическое заполнение названий чекбоксов из данных (с очисткой крайних пробелов)
    data.services.forEach(function(service) {
        if (service.id === 'guide') labelGuide.textContent = service.title.trim() + ' (' + service.price + ' руб.)';
        if (service.id === 'audio') labelAudio.textContent = service.title.trim() + ' (' + service.price + ' руб.)';
        if (service.id === 'catalog') labelCatalog.textContent = service.title.trim() + ' (' + service.price + ' руб.)';
    });

    // Показываем форму, так как JSON корректен
    serviceForm.hidden = false;

} catch (e) {
    // В случае ошибки парсинга — скрываем форму и показываем ошибку данных
    dataError.hidden = false;
    serviceForm.hidden = true;
}

// Обработчик для кнопки "Показать программу"
showProgramBtn.addEventListener('click', function() {
    if (data) {
        programBlock.innerHTML = data.event.meeting;
        programBlock.hidden = false;
    }
});

// Обработчик отправки формы расчета стоимости
serviceForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Читаем состояние чекбоксов
    const guideChecked = guideCheckbox.checked;
    const audioChecked = audioCheckbox.checked;
    const catalogChecked = catalogCheckbox.checked;

    // Проверка на пустой выбор
    if (!guideChecked && !audioChecked && !catalogChecked) {
        choiceError.hidden = false;
        resultBlock.hidden = true;
        reportJsonBlock.hidden = true;
        return;
    }

    // Если выбор не пустой, скрываем ошибку
    choiceError.hidden = true;

    // Генерируем отчет
    const report = buildReport(data.services, guideChecked, audioChecked, catalogChecked);

    // Формируем innerHTML для блока результатов согласно ТЗ
    let resultHtml = 'Выбрано услуг: ' + report.count + '<br>Итого: ' + report.total + ' руб.';
    report.items.forEach(function(item) {
        resultHtml += '<br>' + item.title;
    });
    
    resultBlock.innerHTML = resultHtml;
    resultBlock.hidden = false;

    // Превращаем отчет в JSON-строку и проверяем её через JSON.parse() перед выводом
    const jsonString = JSON.stringify(report);
    try {
        JSON.parse(jsonString); 
        reportJsonBlock.textContent = jsonString;
        reportJsonBlock.hidden = false;
    } catch (jsonErr) {
        reportJsonBlock.hidden = true;
    }
});
