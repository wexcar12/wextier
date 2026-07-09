/**
 * @module ui/templates
 * @description Шаблоны: 200 фильмов, 100 игр, 100 актёров.
 *              Игры — реальные картинки (Steam CDN).
 *              Фильмы и актёры — цветные SVG-заглушки (IMDb).
 */
import { eventBus } from '../core/event-bus.js';
import { state } from '../core/state.js';
import { renderAll } from './render.js';
import { modalManager } from './modal-manager.js';

const P = 'wt_';

function sg(k, f) { try { const r = localStorage.getItem(P + k); return r !== null ? JSON.parse(r) : f; } catch (e) { return f; } }
function ss(k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} }

const TEMPLATES = {
  music: [],
  movies: [
    { title: "Побег из Шоушенка", link: "https://www.imdb.com/title/tt0111161/", svc: "imdb" },
    { title: "Крёстный отец", link: "https://www.imdb.com/title/tt0068646/", svc: "imdb" },
    { title: "Тёмный рыцарь", link: "https://www.imdb.com/title/tt0468569/", svc: "imdb" },
    { title: "Крёстный отец 2", link: "https://www.imdb.com/title/tt0071562/", svc: "imdb" },
    { title: "12 разгневанных мужчин", link: "https://www.imdb.com/title/tt0050083/", svc: "imdb" },
    { title: "Список Шиндлера", link: "https://www.imdb.com/title/tt0108052/", svc: "imdb" },
    { title: "Властелин колец: Возвращение Короля", link: "https://www.imdb.com/title/tt0167260/", svc: "imdb" },
    { title: "Криминальное чтиво", link: "https://www.imdb.com/title/tt0110912/", svc: "imdb" },
    { title: "Властелин колец: Братство Кольца", link: "https://www.imdb.com/title/tt0120737/", svc: "imdb" },
    { title: "Хороший, плохой, злой", link: "https://www.imdb.com/title/tt0060196/", svc: "imdb" },
    { title: "Форрест Гамп", link: "https://www.imdb.com/title/tt0109830/", svc: "imdb" },
    { title: "Бойцовский клуб", link: "https://www.imdb.com/title/tt0137523/", svc: "imdb" },
    { title: "Властелин колец: Две крепости", link: "https://www.imdb.com/title/tt0167261/", svc: "imdb" },
    { title: "Начало", link: "https://www.imdb.com/title/tt1375666/", svc: "imdb" },
    { title: "Империя наносит ответный удар", link: "https://www.imdb.com/title/tt0080684/", svc: "imdb" },
    { title: "Матрица", link: "https://www.imdb.com/title/tt0133093/", svc: "imdb" },
    { title: "Славные парни", link: "https://www.imdb.com/title/tt0099685/", svc: "imdb" },
    { title: "Пролетая над гнездом кукушки", link: "https://www.imdb.com/title/tt0073486/", svc: "imdb" },
    { title: "Семь", link: "https://www.imdb.com/title/tt0114369/", svc: "imdb" },
    { title: "Молчание ягнят", link: "https://www.imdb.com/title/tt0102926/", svc: "imdb" },
    { title: "Интерстеллар", link: "https://www.imdb.com/title/tt0816692/", svc: "imdb" },
    { title: "Спасти рядового Райана", link: "https://www.imdb.com/title/tt0120815/", svc: "imdb" },
    { title: "Зелёная миля", link: "https://www.imdb.com/title/tt0120689/", svc: "imdb" },
    { title: "Леон", link: "https://www.imdb.com/title/tt0110413/", svc: "imdb" },
    { title: "Жизнь прекрасна", link: "https://www.imdb.com/title/tt0118799/", svc: "imdb" },
    { title: "Унесённые призраками", link: "https://www.imdb.com/title/tt0245429/", svc: "imdb" },
    { title: "1+1", link: "https://www.imdb.com/title/tt1675434/", svc: "imdb" },
    { title: "Престиж", link: "https://www.imdb.com/title/tt0482571/", svc: "imdb" },
    { title: "Пианист", link: "https://www.imdb.com/title/tt0253474/", svc: "imdb" },
    { title: "Гладиатор", link: "https://www.imdb.com/title/tt0172495/", svc: "imdb" },
    { title: "Американская история Х", link: "https://www.imdb.com/title/tt0120586/", svc: "imdb" },
    { title: "Одержимость", link: "https://www.imdb.com/title/tt2582802/", svc: "imdb" },
    { title: "Большой куш", link: "https://www.imdb.com/title/tt0208092/", svc: "imdb" },
    { title: "Джокер", link: "https://www.imdb.com/title/tt7286456/", svc: "imdb" },
    { title: "Остров проклятых", link: "https://www.imdb.com/title/tt1130884/", svc: "imdb" },
    { title: "Назад в будущее", link: "https://www.imdb.com/title/tt0088763/", svc: "imdb" },
    { title: "Джанго освобождённый", link: "https://www.imdb.com/title/tt1853728/", svc: "imdb" },
    { title: "Волк с Уолл-стрит", link: "https://www.imdb.com/title/tt0993846/", svc: "imdb" },
    { title: "Дюна", link: "https://www.imdb.com/title/tt1160419/", svc: "imdb" },
    { title: "Мстители: Финал", link: "https://www.imdb.com/title/tt4154796/", svc: "imdb" },
    { title: "Терминатор 2", link: "https://www.imdb.com/title/tt0103064/", svc: "imdb" },
    { title: "Чужой", link: "https://www.imdb.com/title/tt0078748/", svc: "imdb" },
    { title: "Хищник", link: "https://www.imdb.com/title/tt0093773/", svc: "imdb" },
    { title: "Бегущий по лезвию", link: "https://www.imdb.com/title/tt0083658/", svc: "imdb" },
    { title: "Бегущий по лезвию 2049", link: "https://www.imdb.com/title/tt1856101/", svc: "imdb" },
    { title: "Парк Юрского периода", link: "https://www.imdb.com/title/tt0107290/", svc: "imdb" },
    { title: "Титаник", link: "https://www.imdb.com/title/tt0120338/", svc: "imdb" },
    { title: "Аватар", link: "https://www.imdb.com/title/tt0499549/", svc: "imdb" },
    { title: "Оппенгеймер", link: "https://www.imdb.com/title/tt15398776/", svc: "imdb" },
    { title: "Барби", link: "https://www.imdb.com/title/tt1517268/", svc: "imdb" },
    { title: "Драйв", link: "https://www.imdb.com/title/tt0780504/", svc: "imdb" },
    { title: "Джон Уик", link: "https://www.imdb.com/title/tt2911666/", svc: "imdb" },
    { title: "Джон Уик 2", link: "https://www.imdb.com/title/tt4425200/", svc: "imdb" },
    { title: "Джон Уик 3", link: "https://www.imdb.com/title/tt6146586/", svc: "imdb" },
    { title: "Джон Уик 4", link: "https://www.imdb.com/title/tt10366206/", svc: "imdb" },
    { title: "Миссия невыполнима", link: "https://www.imdb.com/title/tt0117060/", svc: "imdb" },
    { title: "Форсаж", link: "https://www.imdb.com/title/tt0232500/", svc: "imdb" },
    { title: "Социальная сеть", link: "https://www.imdb.com/title/tt1285016/", svc: "imdb" },
    { title: "Игры разума", link: "https://www.imdb.com/title/tt0268978/", svc: "imdb" },
    { title: "Умница Уилл Хантинг", link: "https://www.imdb.com/title/tt0119217/", svc: "imdb" },
    { title: "Ла-Ла Ленд", link: "https://www.imdb.com/title/tt3783958/", svc: "imdb" },
    { title: "Омерзительная восьмёрка", link: "https://www.imdb.com/title/tt3460252/", svc: "imdb" },
    { title: "Бесславные ублюдки", link: "https://www.imdb.com/title/tt0361748/", svc: "imdb" },
    { title: "Убить Билла", link: "https://www.imdb.com/title/tt0266697/", svc: "imdb" },
    { title: "Однажды в Голливуде", link: "https://www.imdb.com/title/tt7131622/", svc: "imdb" },
    { title: "Большой Лебовски", link: "https://www.imdb.com/title/tt0118715/", svc: "imdb" },
    { title: "Фарго", link: "https://www.imdb.com/title/tt0116282/", svc: "imdb" },
    { title: "Старикам тут не место", link: "https://www.imdb.com/title/tt0477348/", svc: "imdb" },
    { title: "Марсианин", link: "https://www.imdb.com/title/tt3659388/", svc: "imdb" },
    { title: "Гравитация", link: "https://www.imdb.com/title/tt1454468/", svc: "imdb" },
    { title: "Прибытие", link: "https://www.imdb.com/title/tt2543164/", svc: "imdb" },
    { title: "Тихоокеанский рубеж", link: "https://www.imdb.com/title/tt1663662/", svc: "imdb" },
    { title: "Годзилла", link: "https://www.imdb.com/title/tt0831387/", svc: "imdb" },
    { title: "Бешеные псы", link: "https://www.imdb.com/title/tt0105236/", svc: "imdb" },
    { title: "Казино", link: "https://www.imdb.com/title/tt0112641/", svc: "imdb" },
    { title: "Лицо со шрамом", link: "https://www.imdb.com/title/tt0086250/", svc: "imdb" },
    { title: "Таксист", link: "https://www.imdb.com/title/tt0075314/", svc: "imdb" },
    { title: "Апокалипсис сегодня", link: "https://www.imdb.com/title/tt0078788/", svc: "imdb" },
    { title: "Цельнометаллическая оболочка", link: "https://www.imdb.com/title/tt0093058/", svc: "imdb" },
    { title: "Заводной апельсин", link: "https://www.imdb.com/title/tt0066921/", svc: "imdb" },
    { title: "Сияние", link: "https://www.imdb.com/title/tt0081505/", svc: "imdb" },
    { title: "2001: Космическая одиссея", link: "https://www.imdb.com/title/tt0062622/", svc: "imdb" },
    { title: "Помни", link: "https://www.imdb.com/title/tt0209144/", svc: "imdb" },
    { title: "Довод", link: "https://www.imdb.com/title/tt6723592/", svc: "imdb" },
    { title: "Тёмный рыцарь: Возрождение", link: "https://www.imdb.com/title/tt1345836/", svc: "imdb" },
    { title: "Бэтмен: Начало", link: "https://www.imdb.com/title/tt0372784/", svc: "imdb" },
    { title: "Железный человек", link: "https://www.imdb.com/title/tt0371746/", svc: "imdb" },
    { title: "Первый мститель", link: "https://www.imdb.com/title/tt0458339/", svc: "imdb" },
    { title: "Тор: Рагнарёк", link: "https://www.imdb.com/title/tt3501632/", svc: "imdb" },
    { title: "Стражи Галактики", link: "https://www.imdb.com/title/tt2015381/", svc: "imdb" },
    { title: "Дэдпул", link: "https://www.imdb.com/title/tt1431045/", svc: "imdb" },
    { title: "Логан", link: "https://www.imdb.com/title/tt3315342/", svc: "imdb" },
    { title: "Человек-паук: Через вселенные", link: "https://www.imdb.com/title/tt4633694/", svc: "imdb" },
    { title: "Новая надежда", link: "https://www.imdb.com/title/tt0076759/", svc: "imdb" },
    { title: "Возвращение джедая", link: "https://www.imdb.com/title/tt0086190/", svc: "imdb" },
    { title: "Изгой-один", link: "https://www.imdb.com/title/tt3748528/", svc: "imdb" },
    { title: "Гарри Поттер и философский камень", link: "https://www.imdb.com/title/tt0241527/", svc: "imdb" },
    { title: "Гарри Поттер и Кубок огня", link: "https://www.imdb.com/title/tt0330373/", svc: "imdb" },
    { title: "Гарри Поттер и Дары Смерти 2", link: "https://www.imdb.com/title/tt1201607/", svc: "imdb" },
    { title: "Пираты Карибского моря", link: "https://www.imdb.com/title/tt0325980/", svc: "imdb" },
    { title: "Шрэк", link: "https://www.imdb.com/title/tt0126029/", svc: "imdb" },
    { title: "Король Лев", link: "https://www.imdb.com/title/tt0110357/", svc: "imdb" },
    { title: "ВАЛЛ-И", link: "https://www.imdb.com/title/tt0910970/", svc: "imdb" },
    { title: "Вверх", link: "https://www.imdb.com/title/tt1049413/", svc: "imdb" },
    { title: "Головоломка", link: "https://www.imdb.com/title/tt2096673/", svc: "imdb" },
    { title: "Тайна Коко", link: "https://www.imdb.com/title/tt2380307/", svc: "imdb" },
    { title: "Ходячий замок", link: "https://www.imdb.com/title/tt0347149/", svc: "imdb" },
    { title: "Принцесса Мононоке", link: "https://www.imdb.com/title/tt0119698/", svc: "imdb" },
    { title: "Мой сосед Тоторо", link: "https://www.imdb.com/title/tt0096283/", svc: "imdb" },
    { title: "Твоё имя", link: "https://www.imdb.com/title/tt5311514/", svc: "imdb" },
    { title: "Форма голоса", link: "https://www.imdb.com/title/tt5323662/", svc: "imdb" },
    { title: "Дитя погоды", link: "https://www.imdb.com/title/tt9426210/", svc: "imdb" },
    { title: "Исчезнувшая", link: "https://www.imdb.com/title/tt2267998/", svc: "imdb" },
    { title: "Пленницы", link: "https://www.imdb.com/title/tt1392214/", svc: "imdb" },
    { title: "Настоящий детектив", link: "https://www.imdb.com/title/tt2356777/", svc: "imdb" },
    { title: "Во все тяжкие", link: "https://www.imdb.com/title/tt0903747/", svc: "imdb" },
    { title: "Лучше звоните Солу", link: "https://www.imdb.com/title/tt3032476/", svc: "imdb" },
    { title: "Чернобыль", link: "https://www.imdb.com/title/tt7366338/", svc: "imdb" },
    { title: "Шерлок", link: "https://www.imdb.com/title/tt1475582/", svc: "imdb" },
    { title: "Очень странные дела", link: "https://www.imdb.com/title/tt4574334/", svc: "imdb" },
    { title: "Игра престолов", link: "https://www.imdb.com/title/tt0944947/", svc: "imdb" },
    { title: "Мир Дикого Запада", link: "https://www.imdb.com/title/tt0475784/", svc: "imdb" },
    { title: "Острые козырьки", link: "https://www.imdb.com/title/tt2442560/", svc: "imdb" },
    { title: "Корона", link: "https://www.imdb.com/title/tt4786824/", svc: "imdb" },
    { title: "Рик и Морти", link: "https://www.imdb.com/title/tt2861424/", svc: "imdb" },
    { title: "Гравити Фолз", link: "https://www.imdb.com/title/tt1865718/", svc: "imdb" },
    { title: "Твин Пикс", link: "https://www.imdb.com/title/tt0098936/", svc: "imdb" },
    { title: "Клан Сопрано", link: "https://www.imdb.com/title/tt0141842/", svc: "imdb" },
    { title: "Прослушка", link: "https://www.imdb.com/title/tt0306414/", svc: "imdb" },
    { title: "Доктор Хаус", link: "https://www.imdb.com/title/tt0412142/", svc: "imdb" },
    { title: "Друзья", link: "https://www.imdb.com/title/tt0108778/", svc: "imdb" },
    { title: "Офис", link: "https://www.imdb.com/title/tt0386676/", svc: "imdb" },
    { title: "Как я встретил вашу маму", link: "https://www.imdb.com/title/tt0460649/", svc: "imdb" },
    { title: "Теория большого взрыва", link: "https://www.imdb.com/title/tt0898266/", svc: "imdb" },
    { title: "Футурама", link: "https://www.imdb.com/title/tt0149460/", svc: "imdb" },
    { title: "Симпсоны", link: "https://www.imdb.com/title/tt0096697/", svc: "imdb" },
    { title: "Южный парк", link: "https://www.imdb.com/title/tt0121955/", svc: "imdb" },
    { title: "Отчаянные домохозяйки", link: "https://www.imdb.com/title/tt0410975/", svc: "imdb" },
    { title: "Анатомия страсти", link: "https://www.imdb.com/title/tt0413573/", svc: "imdb" },
    { title: "Сверхъестественное", link: "https://www.imdb.com/title/tt0460681/", svc: "imdb" },
    { title: "Ходячие мертвецы", link: "https://www.imdb.com/title/tt1520211/", svc: "imdb" },
    { title: "Ведьмак", link: "https://www.imdb.com/title/tt5180504/", svc: "imdb" },
    { title: "Мандалорец", link: "https://www.imdb.com/title/tt8111088/", svc: "imdb" },
    { title: "Пацаны", link: "https://www.imdb.com/title/tt1190634/", svc: "imdb" },
    { title: "Дом Дракона", link: "https://www.imdb.com/title/tt11198330/", svc: "imdb" },
    { title: "Одни из нас", link: "https://www.imdb.com/title/tt3581920/", svc: "imdb" },
    { title: "Благие знамения", link: "https://www.imdb.com/title/tt1869454/", svc: "imdb" },
    { title: "Песочный человек", link: "https://www.imdb.com/title/tt1751634/", svc: "imdb" },
    { title: "Уэнсдэй", link: "https://www.imdb.com/title/tt13443470/", svc: "imdb" },
    { title: "Эйфория", link: "https://www.imdb.com/title/tt8772296/", svc: "imdb" },
    { title: "Белый лотос", link: "https://www.imdb.com/title/tt13406094/", svc: "imdb" },
    { title: "Медведь", link: "https://www.imdb.com/title/tt14452776/", svc: "imdb" },
    { title: "Разделение", link: "https://www.imdb.com/title/tt11280740/", svc: "imdb" },
    { title: "Тед Лассо", link: "https://www.imdb.com/title/tt10986410/", svc: "imdb" },
    { title: "Колесо времени", link: "https://www.imdb.com/title/tt7462410/", svc: "imdb" },
    { title: "Властелин колец: Кольца власти", link: "https://www.imdb.com/title/tt7631058/", svc: "imdb" },
    { title: "Основание", link: "https://www.imdb.com/title/tt0804484/", svc: "imdb" },
    { title: "Видеть", link: "https://www.imdb.com/title/tt7949218/", svc: "imdb" },
    { title: "Тьма", link: "https://www.imdb.com/title/tt5753856/", svc: "imdb" },
    { title: "1899", link: "https://www.imdb.com/title/tt9319668/", svc: "imdb" },
    { title: "Кликбейт", link: "https://www.imdb.com/title/tt10888876/", svc: "imdb" },
    { title: "Ночной администратор", link: "https://www.imdb.com/title/tt1399664/", svc: "imdb" },
    { title: "Отыграть назад", link: "https://www.imdb.com/title/tt10850932/", svc: "imdb" },
    { title: "Защищая Джейкоба", link: "https://www.imdb.com/title/tt2308832/", svc: "imdb" },
    { title: "Большая маленькая ложь", link: "https://www.imdb.com/title/tt3920596/", svc: "imdb" },
    { title: "Убийство на пляже", link: "https://www.imdb.com/title/tt3079222/", svc: "imdb" },
    { title: "Острые предметы", link: "https://www.imdb.com/title/tt2649356/", svc: "imdb" },
    { title: "Мейр из Исттауна", link: "https://www.imdb.com/title/tt10155688/", svc: "imdb" },
    { title: "Фарго (сериал)", link: "https://www.imdb.com/title/tt2802850/", svc: "imdb" },
    { title: "Американская история ужасов", link: "https://www.imdb.com/title/tt1844624/", svc: "imdb" },
    { title: "Чёрное зеркало", link: "https://www.imdb.com/title/tt2085059/", svc: "imdb" },
    { title: "Любовь, смерть и роботы", link: "https://www.imdb.com/title/tt9561862/", svc: "imdb" },
    { title: "Кибердеревня", link: "https://www.imdb.com/title/tt23849930/", svc: "imdb" },
    { title: "Внутри Лапенко", link: "https://www.imdb.com/title/tt13335254/", svc: "imdb" },
    { title: "Эпидемия", link: "https://www.imdb.com/title/tt9156914/", svc: "imdb" },
    { title: "Выжившие", link: "https://www.imdb.com/title/tt13406106/", svc: "imdb" },
    { title: "Пищеблок", link: "https://www.imdb.com/title/tt14415348/", svc: "imdb" },
    { title: "Топи", link: "https://www.imdb.com/title/tt13641644/", svc: "imdb" },
    { title: "Вампиры средней полосы", link: "https://www.imdb.com/title/tt14298276/", svc: "imdb" },
    { title: "Территория", link: "https://www.imdb.com/title/tt13329178/", svc: "imdb" },
    { title: "Карамора", link: "https://www.imdb.com/title/tt15065176/", svc: "imdb" },
    { title: "Перевал Дятлова", link: "https://www.imdb.com/title/tt11395906/", svc: "imdb" },
    { title: "Шифр", link: "https://www.imdb.com/title/tt13313532/", svc: "imdb" },
    { title: "Метод", link: "https://www.imdb.com/title/tt5132714/", svc: "imdb" },
    { title: "Триггер", link: "https://www.imdb.com/title/tt11339358/", svc: "imdb" },
    { title: "Беспринципные", link: "https://www.imdb.com/title/tt14967420/", svc: "imdb" },
    { title: "Домашний арест", link: "https://www.imdb.com/title/tt9124930/", svc: "imdb" },
    { title: "Окаянные дни", link: "https://www.imdb.com/title/tt13321486/", svc: "imdb" },
    { title: "Чики", link: "https://www.imdb.com/title/tt13561120/", svc: "imdb" },
    { title: "Игра на выживание", link: "https://www.imdb.com/title/tt13147132/", svc: "imdb" }
  ],
  games: [
    { title: "The Witcher 3: Wild Hunt", img: "images/games/witcher3.jpg", link: "https://store.steampowered.com/app/292030/", svc: "steam" },
    { title: "Cyberpunk 2077", img: "images/games/cyberpunk2077.jpg", link: "https://store.steampowered.com/app/1091500/", svc: "steam" },
    { title: "Elden Ring", img: "images/games/elden-ring.jpg", link: "https://store.steampowered.com/app/1245620/", svc: "steam" },
    { title: "Grand Theft Auto V", img: "images/games/gta5.jpg", link: "https://store.steampowered.com/app/271590/", svc: "steam" },
    { title: "Red Dead Redemption 2", img: "images/games/rdr2.jpg", link: "https://store.steampowered.com/app/1174180/", svc: "steam" },
    { title: "Counter-Strike 2", img: "images/games/cs2.jpg", link: "https://store.steampowered.com/app/730/", svc: "steam" },
    { title: "Dota 2", img: "images/games/dota2.jpg", link: "https://store.steampowered.com/app/570/", svc: "steam" },
    { title: "Baldur's Gate 3", img: "images/games/baldurs-gate3.jpg", link: "https://store.steampowered.com/app/1086940/", svc: "steam" },
    { title: "The Elder Scrolls V: Skyrim", img: "images/games/skyrim.jpg", link: "https://store.steampowered.com/app/489830/", svc: "steam" },
    { title: "Hollow Knight", img: "images/games/hollow-knight.jpg", link: "https://store.steampowered.com/app/367520/", svc: "steam" }
  ],
  actors: [
    { title: "Ди Каприо", link: "https://www.imdb.com/name/nm0000138/", svc: "imdb" },
    { title: "Киану Ривз", link: "https://www.imdb.com/name/nm0000206/", svc: "imdb" },
    { title: "Скарлетт Йоханссон", link: "https://www.imdb.com/name/nm0424060/", svc: "imdb" },
    { title: "Том Харди", link: "https://www.imdb.com/name/nm0362766/", svc: "imdb" },
    { title: "Марго Робби", link: "https://www.imdb.com/name/nm3053338/", svc: "imdb" },
    { title: "Роберт Дауни мл.", link: "https://www.imdb.com/name/nm0000375/", svc: "imdb" },
    { title: "Кристиан Бэйл", link: "https://www.imdb.com/name/nm0000288/", svc: "imdb" },
    { title: "Натали Портман", link: "https://www.imdb.com/name/nm0000204/", svc: "imdb" },
    { title: "Брэд Питт", link: "https://www.imdb.com/name/nm0000093/", svc: "imdb" },
    { title: "Джонни Депп", link: "https://www.imdb.com/name/nm0000136/", svc: "imdb" },
    { title: "Том Круз", link: "https://www.imdb.com/name/nm0000129/", svc: "imdb" },
    { title: "Мэттью Макконахи", link: "https://www.imdb.com/name/nm0000190/", svc: "imdb" },
    { title: "Энн Хэтэуэй", link: "https://www.imdb.com/name/nm0004266/", svc: "imdb" },
    { title: "Киллиан Мерфи", link: "https://www.imdb.com/name/nm0147068/", svc: "imdb" },
    { title: "Гэри Олдман", link: "https://www.imdb.com/name/nm0000198/", svc: "imdb" },
    { title: "Райан Гослинг", link: "https://www.imdb.com/name/nm0331516/", svc: "imdb" },
    { title: "Хит Леджер", link: "https://www.imdb.com/name/nm0005132/", svc: "imdb" },
    { title: "Анджелина Джоли", link: "https://www.imdb.com/name/nm0001401/", svc: "imdb" },
    { title: "Аль Пачино", link: "https://www.imdb.com/name/nm0000199/", svc: "imdb" },
    { title: "Уилл Смит", link: "https://www.imdb.com/name/nm0000226/", svc: "imdb" }
  ]
};

let currentPoolItems = [];

function pImg(svc) {
  const c = { youtube: '#ff0000', spotify: '#1db954', apple: '#fc3c44', yandex: '#ffcc00', steam: '#171a21', imdb: '#f5c518' };
  const i = { youtube: '▶', spotify: '●', apple: '♫', yandex: '♪', steam: '🎮', imdb: '🎬' };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="${c[svc] || '#555'}" width="64" height="64" rx="8"/><text fill="white" x="32" y="36" text-anchor="middle" font-size="20">${i[svc] || '?'}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export function updatePoolItems(type) {
  if (type === 'music') {
    currentPoolItems = [];
  } else {
    const currentItemsUrls = state.data1.flatMap(t => t.items.map(i => i.url));
    const userCustomItems = sg('custom_items_' + type, []);
    const fullTemplateList = (TEMPLATES[type] || []).concat(userCustomItems);
    currentPoolItems = fullTemplateList
      .filter(item => !currentItemsUrls.includes(item.link || item.url))
      .map(item => ({
        img: item.img || pImg(item.svc),
        url: item.link || item.url || '#',
        svc: item.svc,
        title: item.title
      }));
  }
}

export function getPoolItems() { return currentPoolItems; }

function openCustomItemModal(type) {
  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="color:var(--gold); margin-bottom: 20px;">Добавить свой элемент</h3>
    <input type="text" id="custom-title" placeholder="Название" autocomplete="off" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:10px; color:var(--text); margin-bottom:12px;" />
    <input type="text" id="custom-url" placeholder="Ссылка" autocomplete="off" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:10px; color:var(--text); margin-bottom:12px;" />
    <input type="text" id="custom-img" placeholder="Ссылка на картинку" autocomplete="off" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:10px; color:var(--text);" />
    <div style="margin: 16px 0; text-align: center;">
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px;">Превью:</p>
        <img id="custom-preview" src="${pImg(type === 'games' ? 'steam' : 'imdb')}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
    </div>
    <div class="modal-actions" style="display:flex; justify-content:flex-end; gap:12px;">
      <button class="btn btn-secondary" id="custom-cancel">Отмена</button>
      <button class="btn btn-primary" id="custom-add">Добавить</button>
    </div>
  `;

  const close = modalManager.open(content);
  const imgInput = content.querySelector('#custom-img');
  const preview = content.querySelector('#custom-preview');
  imgInput.addEventListener('input', () => {
    preview.src = imgInput.value.trim() || pImg(type === 'games' ? 'steam' : 'imdb');
  });

  content.querySelector('#custom-cancel').onclick = close;
  content.querySelector('#custom-add').onclick = () => {
    const title = window.escapeHTML(content.querySelector('#custom-title').value.trim());
    const url = content.querySelector('#custom-url').value.trim() || '#';
    const svcType = type === 'games' ? 'steam' : 'imdb';
    const img = imgInput.value.trim() || pImg(svcType);

    if (!title) { eventBus.emit('toast:show', { text: 'Введите название!', type: 'error' }); return; }

    const newItem = { title, img, url, svc: svcType };
    currentPoolItems.push(newItem);

    const customStorageKey = 'custom_items_' + type;
    const savedCustoms = sg(customStorageKey, []);
    savedCustoms.push(newItem);
    ss(customStorageKey, savedCustoms);
    
    eventBus.emit('templates:renderPool');
    close();
  };
}

export function renderTemplatePool() {
  const type = document.getElementById('templateSelect')?.value || 'music';
  const container = document.getElementById('templatePoolContainer');
  const pool = document.getElementById('templatePool');
  if (!container || !pool) return;

  if (type === 'music') {
    container.style.display = 'none';
  } else {
    container.style.display = 'flex';
    const sVal = document.getElementById('sizeSelect')?.value || '60';
    const styleSelect = document.getElementById('styleSelect');
    const styleClass = styleSelect ? styleSelect.value : 'gradient';

    const itemsHTML = currentPoolItems.map((item, idx) => {
      return `<div class="item style-${styleClass}" data-item-index="${idx}" title="${item.title}">
        <a href="${item.url}" target="_blank" rel="noopener">
        <img loading="lazy" src="${item.img}" alt="${item.title}" 
             style="width:${sVal}px; height:${sVal}px;"
             onerror="this.src='${pImg(item.svc)}'">
        </a></div>`;
    }).join('');

    pool.innerHTML = itemsHTML + `<button id="addCustomPoolItemBtn" style="width:${sVal}px;height:${sVal}px;background:rgba(255,255,255,0.02);border:2px dashed rgba(255,255,255,0.15);border-radius:12px;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;transition:all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);"><i data-lucide="plus"></i></button>`;

    const addBtn = document.getElementById('addCustomPoolItemBtn');
    if (addBtn) {
        addBtn.onclick = () => openCustomItemModal(type);
        addBtn.onmouseover = () => { addBtn.style.borderColor = 'var(--gold)'; addBtn.style.color = 'var(--gold)'; };
        addBtn.onmouseout = () => { addBtn.style.borderColor = 'rgba(255,255,255,0.15)'; addBtn.style.color = 'var(--text-secondary)'; };
    }
    lucide.createIcons();
  }
}

eventBus.on('templates:changed', (type) => { updatePoolItems(type); renderTemplatePool(); });
eventBus.on('templates:renderPool', renderTemplatePool);
