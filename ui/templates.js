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
    { title: "The Witcher 3: Wild Hunt", link: "https://store.steampowered.com/app/292030/", svc: "steam" },
    { title: "Cyberpunk 2077", link: "https://store.steampowered.com/app/1091500/", svc: "steam" },
    { title: "Elden Ring", link: "https://store.steampowered.com/app/1245620/", svc: "steam" },
    { title: "Grand Theft Auto V", link: "https://store.steampowered.com/app/271590/", svc: "steam" },
    { title: "Red Dead Redemption 2", link: "https://store.steampowered.com/app/1174180/", svc: "steam" },
    { title: "Counter-Strike 2", link: "https://store.steampowered.com/app/730/", svc: "steam" },
    { title: "Dota 2", link: "https://store.steampowered.com/app/570/", svc: "steam" },
    { title: "Baldur's Gate 3", link: "https://store.steampowered.com/app/1086940/", svc: "steam" },
    { title: "The Elder Scrolls V: Skyrim", link: "https://store.steampowered.com/app/489830/", svc: "steam" },
    { title: "Hollow Knight", link: "https://store.steampowered.com/app/367520/", svc: "steam" },
    { title: "Portal 2", link: "https://store.steampowered.com/app/620/", svc: "steam" },
    { title: "Half-Life 2", link: "https://store.steampowered.com/app/220/", svc: "steam" },
    { title: "Half-Life: Alyx", link: "https://store.steampowered.com/app/546560/", svc: "steam" },
    { title: "Portal", link: "https://store.steampowered.com/app/400/", svc: "steam" },
    { title: "Half-Life", link: "https://store.steampowered.com/app/70/", svc: "steam" },
    { title: "Terraria", link: "https://store.steampowered.com/app/105600/", svc: "steam" },
    { title: "Stardew Valley", link: "https://store.steampowered.com/app/413150/", svc: "steam" },
    { title: "Team Fortress 2", link: "https://store.steampowered.com/app/440/", svc: "steam" },
    { title: "Left 4 Dead 2", link: "https://store.steampowered.com/app/550/", svc: "steam" },
    { title: "Garry's Mod", link: "https://store.steampowered.com/app/4000/", svc: "steam" },
    { title: "Rust", link: "https://store.steampowered.com/app/252490/", svc: "steam" },
    { title: "ARK: Survival Evolved", link: "https://store.steampowered.com/app/346110/", svc: "steam" },
    { title: "PUBG: BATTLEGROUNDS", link: "https://store.steampowered.com/app/578080/", svc: "steam" },
    { title: "Apex Legends", link: "https://store.steampowered.com/app/1172470/", svc: "steam" },
    { title: "Destiny 2", link: "https://store.steampowered.com/app/1085660/", svc: "steam" },
    { title: "Warframe", link: "https://store.steampowered.com/app/230410/", svc: "steam" },
    { title: "Path of Exile", link: "https://store.steampowered.com/app/238960/", svc: "steam" },
    { title: "Sid Meier's Civilization VI", link: "https://store.steampowered.com/app/289070/", svc: "steam" },
    { title: "Sid Meier's Civilization V", link: "https://store.steampowered.com/app/8930/", svc: "steam" },
    { title: "Total War: WARHAMMER III", link: "https://store.steampowered.com/app/1142710/", svc: "steam" },
    { title: "Divinity: Original Sin 2", link: "https://store.steampowered.com/app/435150/", svc: "steam" },
    { title: "Disco Elysium", link: "https://store.steampowered.com/app/632470/", svc: "steam" },
    { title: "Hades", link: "https://store.steampowered.com/app/1145360/", svc: "steam" },
    { title: "Celeste", link: "https://store.steampowered.com/app/504230/", svc: "steam" },
    { title: "Undertale", link: "https://store.steampowered.com/app/391540/", svc: "steam" },
    { title: "Cuphead", link: "https://store.steampowered.com/app/268910/", svc: "steam" },
    { title: "Ori and the Blind Forest", link: "https://store.steampowered.com/app/261570/", svc: "steam" },
    { title: "Ori and the Will of the Wisps", link: "https://store.steampowered.com/app/1057090/", svc: "steam" },
    { title: "Dead Cells", link: "https://store.steampowered.com/app/588650/", svc: "steam" },
    { title: "Slay the Spire", link: "https://store.steampowered.com/app/646570/", svc: "steam" },
    { title: "It Takes Two", link: "https://store.steampowered.com/app/1426210/", svc: "steam" },
    { title: "A Way Out", link: "https://store.steampowered.com/app/1222700/", svc: "steam" },
    { title: "Sekiro: Shadows Die Twice", link: "https://store.steampowered.com/app/814380/", svc: "steam" },
    { title: "Dark Souls III", link: "https://store.steampowered.com/app/374320/", svc: "steam" },
    { title: "Dark Souls Remastered", link: "https://store.steampowered.com/app/570940/", svc: "steam" },
    { title: "Monster Hunter: World", link: "https://store.steampowered.com/app/582010/", svc: "steam" },
    { title: "Resident Evil Village", link: "https://store.steampowered.com/app/1196590/", svc: "steam" },
    { title: "DOOM Eternal", link: "https://store.steampowered.com/app/782330/", svc: "steam" },
    { title: "DOOM (2016)", link: "https://store.steampowered.com/app/379720/", svc: "steam" },
    { title: "Fallout 4", link: "https://store.steampowered.com/app/377160/", svc: "steam" },
    { title: "Fallout: New Vegas", link: "https://store.steampowered.com/app/22380/", svc: "steam" },
    { title: "The Elder Scrolls Online", link: "https://store.steampowered.com/app/306130/", svc: "steam" },
    { title: "Grand Theft Auto: San Andreas", link: "https://store.steampowered.com/app/12120/", svc: "steam" },
    { title: "Grand Theft Auto IV", link: "https://store.steampowered.com/app/12210/", svc: "steam" },
    { title: "Grand Theft Auto: Vice City", link: "https://store.steampowered.com/app/12110/", svc: "steam" },
    { title: "Max Payne 3", link: "https://store.steampowered.com/app/204100/", svc: "steam" },
    { title: "L.A. Noire", link: "https://store.steampowered.com/app/45880/", svc: "steam" },
    { title: "Metro Exodus", link: "https://store.steampowered.com/app/412020/", svc: "steam" },
    { title: "Tomb Raider (2013)", link: "https://store.steampowered.com/app/203160/", svc: "steam" },
    { title: "Rise of the Tomb Raider", link: "https://store.steampowered.com/app/391220/", svc: "steam" },
    { title: "Shadow of the Tomb Raider", link: "https://store.steampowered.com/app/750920/", svc: "steam" },
    { title: "Assassin's Creed Valhalla", link: "https://store.steampowered.com/app/2208920/", svc: "steam" },
    { title: "Assassin's Creed Odyssey", link: "https://store.steampowered.com/app/812140/", svc: "steam" },
    { title: "Assassin's Creed Origins", link: "https://store.steampowered.com/app/582160/", svc: "steam" },
    { title: "Far Cry 5", link: "https://store.steampowered.com/app/552520/", svc: "steam" },
    { title: "Watch Dogs 2", link: "https://store.steampowered.com/app/447040/", svc: "steam" },
    { title: "No Man's Sky", link: "https://store.steampowered.com/app/275850/", svc: "steam" },
    { title: "Subnautica", link: "https://store.steampowered.com/app/264710/", svc: "steam" },
    { title: "Valheim", link: "https://store.steampowered.com/app/892970/", svc: "steam" },
    { title: "Don't Starve Together", link: "https://store.steampowered.com/app/322330/", svc: "steam" },
    { title: "Factorio", link: "https://store.steampowered.com/app/427520/", svc: "steam" },
    { title: "Satisfactory", link: "https://store.steampowered.com/app/526870/", svc: "steam" },
    { title: "Cities: Skylines", link: "https://store.steampowered.com/app/255710/", svc: "steam" },
    { title: "Cities: Skylines II", link: "https://store.steampowered.com/app/949230/", svc: "steam" },
    { title: "Planet Coaster", link: "https://store.steampowered.com/app/493340/", svc: "steam" },
    { title: "Among Us", link: "https://store.steampowered.com/app/945360/", svc: "steam" },
    { title: "Human: Fall Flat", link: "https://store.steampowered.com/app/477160/", svc: "steam" },
    { title: "Goat Simulator", link: "https://store.steampowered.com/app/265930/", svc: "steam" },
    { title: "PAYDAY 2", link: "https://store.steampowered.com/app/218620/", svc: "steam" },
    { title: "PAYDAY 3", link: "https://store.steampowered.com/app/1272080/", svc: "steam" },
    { title: "Deep Rock Galactic", link: "https://store.steampowered.com/app/548430/", svc: "steam" },
    { title: "Phasmophobia", link: "https://store.steampowered.com/app/739630/", svc: "steam" },
    { title: "Lethal Company", link: "https://store.steampowered.com/app/1966720/", svc: "steam" },
    { title: "Risk of Rain 2", link: "https://store.steampowered.com/app/632360/", svc: "steam" },
    { title: "Vampire Survivors", link: "https://store.steampowered.com/app/1794680/", svc: "steam" },
    { title: "Horizon Zero Dawn", link: "https://store.steampowered.com/app/1151640/", svc: "steam" },
    { title: "Death Stranding", link: "https://store.steampowered.com/app/1850570/", svc: "steam" },
    { title: "Marvel's Spider-Man Remastered", link: "https://store.steampowered.com/app/1817070/", svc: "steam" },
    { title: "Batman: Arkham Knight", link: "https://store.steampowered.com/app/208650/", svc: "steam" },
    { title: "Batman: Arkham City", link: "https://store.steampowered.com/app/200260/", svc: "steam" },
    { title: "Middle-earth: Shadow of Mordor", link: "https://store.steampowered.com/app/241930/", svc: "steam" },
    { title: "Middle-earth: Shadow of War", link: "https://store.steampowered.com/app/356190/", svc: "steam" },
    { title: "Mass Effect Legendary Edition", link: "https://store.steampowered.com/app/1328670/", svc: "steam" },
    { title: "Rainbow Six Siege", link: "https://store.steampowered.com/app/359550/", svc: "steam" },
    { title: "For Honor", link: "https://store.steampowered.com/app/304390/", svc: "steam" },
    { title: "Tom Clancy's The Division 2", link: "https://store.steampowered.com/app/667790/", svc: "steam" },
    { title: "Titanfall 2", link: "https://store.steampowered.com/app/1237970/", svc: "steam" },
    { title: "Star Wars Jedi: Fallen Order", link: "https://store.steampowered.com/app/1172380/", svc: "steam" },
    { title: "Star Wars Jedi: Survivor", link: "https://store.steampowered.com/app/1774580/", svc: "steam" },
    { title: "Halo Infinite", link: "https://store.steampowered.com/app/1240440/", svc: "steam" },
    { title: "Halo: The Master Chief Collection", link: "https://store.steampowered.com/app/976730/", svc: "steam" },
    { title: "Forza Horizon 5", link: "https://store.steampowered.com/app/1551360/", svc: "steam" },
    { title: "Rocket League", link: "https://store.steampowered.com/app/252950/", svc: "steam" },
    { title: "Brawlhalla", link: "https://store.steampowered.com/app/291550/", svc: "steam" },
    { title: "Overcooked! 2", link: "https://store.steampowered.com/app/728880/", svc: "steam" },
    { title: "Raft", link: "https://store.steampowered.com/app/648800/", svc: "steam" },
    { title: "The Forest", link: "https://store.steampowered.com/app/242760/", svc: "steam" },
    { title: "Sons of the Forest", link: "https://store.steampowered.com/app/1326470/", svc: "steam" },
    { title: "7 Days to Die", link: "https://store.steampowered.com/app/251570/", svc: "steam" },
    { title: "Project Zomboid", link: "https://store.steampowered.com/app/108600/", svc: "steam" }
  ],
  actors: [
    { title: "Ди Каприо", link: "https://www.imdb.com/name/nm0000138/", svc: "imdb", wiki: "Leonardo_DiCaprio" },
    { title: "Киану Ривз", link: "https://www.imdb.com/name/nm0000206/", svc: "imdb", wiki: "Keanu_Reeves" },
    { title: "Скарлетт Йоханссон", link: "https://www.imdb.com/name/nm0424060/", svc: "imdb", wiki: "Scarlett_Johansson" },
    { title: "Том Харди", link: "https://www.imdb.com/name/nm0362766/", svc: "imdb", wiki: "Tom_Hardy" },
    { title: "Марго Робби", link: "https://www.imdb.com/name/nm3053338/", svc: "imdb", wiki: "Margot_Robbie" },
    { title: "Роберт Дауни мл.", link: "https://www.imdb.com/name/nm0000375/", svc: "imdb", wiki: "Robert_Downey_Jr." },
    { title: "Кристиан Бэйл", link: "https://www.imdb.com/name/nm0000288/", svc: "imdb", wiki: "Christian_Bale" },
    { title: "Натали Портман", link: "https://www.imdb.com/name/nm0000204/", svc: "imdb", wiki: "Natalie_Portman" },
    { title: "Брэд Питт", link: "https://www.imdb.com/name/nm0000093/", svc: "imdb", wiki: "Brad_Pitt" },
    { title: "Джонни Депп", link: "https://www.imdb.com/name/nm0000136/", svc: "imdb", wiki: "Johnny_Depp" },
    { title: "Том Круз", link: "https://www.imdb.com/name/nm0000129/", svc: "imdb", wiki: "Tom_Cruise" },
    { title: "Мэттью Макконахи", link: "https://www.imdb.com/name/nm0000190/", svc: "imdb", wiki: "Matthew_McConaughey" },
    { title: "Энн Хэтэуэй", link: "https://www.imdb.com/name/nm0004266/", svc: "imdb", wiki: "Anne_Hathaway" },
    { title: "Киллиан Мерфи", link: "https://www.imdb.com/name/nm0147068/", svc: "imdb", wiki: "Cillian_Murphy" },
    { title: "Гэри Олдман", link: "https://www.imdb.com/name/nm0000198/", svc: "imdb", wiki: "Gary_Oldman" },
    { title: "Райан Гослинг", link: "https://www.imdb.com/name/nm0331516/", svc: "imdb", wiki: "Ryan_Gosling" },
    { title: "Хит Леджер", link: "https://www.imdb.com/name/nm0005132/", svc: "imdb", wiki: "Heath_Ledger" },
    { title: "Анджелина Джоли", link: "https://www.imdb.com/name/nm0001401/", svc: "imdb", wiki: "Angelina_Jolie" },
    { title: "Аль Пачино", link: "https://www.imdb.com/name/nm0000199/", svc: "imdb", wiki: "Al_Pacino" },
    { title: "Уилл Смит", link: "https://www.imdb.com/name/nm0000226/", svc: "imdb", wiki: "Will_Smith" },
    { title: "Мэрил Стрип", link: "https://www.imdb.com/find/?q=Meryl+Streep&s=nm", svc: "imdb", wiki: "Meryl_Streep" },
    { title: "Дензел Вашингтон", link: "https://www.imdb.com/find/?q=Denzel+Washington&s=nm", svc: "imdb", wiki: "Denzel_Washington" },
    { title: "Том Хэнкс", link: "https://www.imdb.com/find/?q=Tom+Hanks&s=nm", svc: "imdb", wiki: "Tom_Hanks" },
    { title: "Морган Фриман", link: "https://www.imdb.com/find/?q=Morgan+Freeman&s=nm", svc: "imdb", wiki: "Morgan_Freeman" },
    { title: "Сэмюэл Л. Джексон", link: "https://www.imdb.com/find/?q=Samuel+L+Jackson&s=nm", svc: "imdb", wiki: "Samuel_L._Jackson" },
    { title: "Джек Николсон", link: "https://www.imdb.com/find/?q=Jack+Nicholson&s=nm", svc: "imdb", wiki: "Jack_Nicholson" },
    { title: "Роберт Де Ниро", link: "https://www.imdb.com/find/?q=Robert+De+Niro&s=nm", svc: "imdb", wiki: "Robert_De_Niro" },
    { title: "Энтони Хопкинс", link: "https://www.imdb.com/find/?q=Anthony+Hopkins&s=nm", svc: "imdb", wiki: "Anthony_Hopkins" },
    { title: "Дэниэл Дэй-Льюис", link: "https://www.imdb.com/find/?q=Daniel+Day-Lewis&s=nm", svc: "imdb", wiki: "Daniel_Day-Lewis" },
    { title: "Хоакин Феникс", link: "https://www.imdb.com/find/?q=Joaquin+Phoenix&s=nm", svc: "imdb", wiki: "Joaquin_Phoenix" },
    { title: "Шарлиз Терон", link: "https://www.imdb.com/find/?q=Charlize+Theron&s=nm", svc: "imdb", wiki: "Charlize_Theron" },
    { title: "Николь Кидман", link: "https://www.imdb.com/find/?q=Nicole+Kidman&s=nm", svc: "imdb", wiki: "Nicole_Kidman" },
    { title: "Кейт Бланшетт", link: "https://www.imdb.com/find/?q=Cate+Blanchett&s=nm", svc: "imdb", wiki: "Cate_Blanchett" },
    { title: "Эмма Стоун", link: "https://www.imdb.com/find/?q=Emma+Stone&s=nm", svc: "imdb", wiki: "Emma_Stone" },
    { title: "Эмма Уотсон", link: "https://www.imdb.com/find/?q=Emma+Watson&s=nm", svc: "imdb", wiki: "Emma_Watson" },
    { title: "Дженнифер Лоуренс", link: "https://www.imdb.com/find/?q=Jennifer+Lawrence&s=nm", svc: "imdb", wiki: "Jennifer_Lawrence" },
    { title: "Сандра Буллок", link: "https://www.imdb.com/find/?q=Sandra+Bullock&s=nm", svc: "imdb", wiki: "Sandra_Bullock" },
    { title: "Джулия Робертс", link: "https://www.imdb.com/find/?q=Julia+Roberts&s=nm", svc: "imdb", wiki: "Julia_Roberts" },
    { title: "Риз Уизерспун", link: "https://www.imdb.com/find/?q=Reese+Witherspoon&s=nm", svc: "imdb", wiki: "Reese_Witherspoon" },
    { title: "Эми Адамс", link: "https://www.imdb.com/find/?q=Amy+Adams&s=nm", svc: "imdb", wiki: "Amy_Adams" },
    { title: "Виола Дэвис", link: "https://www.imdb.com/find/?q=Viola+Davis&s=nm", svc: "imdb", wiki: "Viola_Davis" },
    { title: "Зендея", link: "https://www.imdb.com/find/?q=Zendaya&s=nm", svc: "imdb", wiki: "Zendaya" },
    { title: "Флоренс Пью", link: "https://www.imdb.com/find/?q=Florence+Pugh&s=nm", svc: "imdb", wiki: "Florence_Pugh" },
    { title: "Тимоти Шаламе", link: "https://www.imdb.com/find/?q=Timothee+Chalamet&s=nm", svc: "imdb", wiki: "Timothée_Chalamet" },
    { title: "Крис Хемсворт", link: "https://www.imdb.com/find/?q=Chris+Hemsworth&s=nm", svc: "imdb", wiki: "Chris_Hemsworth" },
    { title: "Крис Эванс", link: "https://www.imdb.com/find/?q=Chris+Evans+actor&s=nm", svc: "imdb", wiki: "Chris_Evans_(actor)" },
    { title: "Крис Прэтт", link: "https://www.imdb.com/find/?q=Chris+Pratt&s=nm", svc: "imdb", wiki: "Chris_Pratt" },
    { title: "Марк Руффало", link: "https://www.imdb.com/find/?q=Mark+Ruffalo&s=nm", svc: "imdb", wiki: "Mark_Ruffalo" },
    { title: "Джереми Реннер", link: "https://www.imdb.com/find/?q=Jeremy+Renner&s=nm", svc: "imdb", wiki: "Jeremy_Renner" },
    { title: "Бенедикт Камбербэтч", link: "https://www.imdb.com/find/?q=Benedict+Cumberbatch&s=nm", svc: "imdb", wiki: "Benedict_Cumberbatch" },
    { title: "Том Холланд", link: "https://www.imdb.com/find/?q=Tom+Holland&s=nm", svc: "imdb", wiki: "Tom_Holland" },
    { title: "Эндрю Гарфилд", link: "https://www.imdb.com/find/?q=Andrew+Garfield&s=nm", svc: "imdb", wiki: "Andrew_Garfield" },
    { title: "Тоби Магуайр", link: "https://www.imdb.com/find/?q=Tobey+Maguire&s=nm", svc: "imdb", wiki: "Tobey_Maguire" },
    { title: "Хью Джекман", link: "https://www.imdb.com/find/?q=Hugh+Jackman&s=nm", svc: "imdb", wiki: "Hugh_Jackman" },
    { title: "Райан Рейнольдс", link: "https://www.imdb.com/find/?q=Ryan+Reynolds&s=nm", svc: "imdb", wiki: "Ryan_Reynolds" },
    { title: "Дуэйн Джонсон", link: "https://www.imdb.com/find/?q=Dwayne+Johnson&s=nm", svc: "imdb", wiki: "Dwayne_Johnson" },
    { title: "Вин Дизель", link: "https://www.imdb.com/find/?q=Vin+Diesel&s=nm", svc: "imdb", wiki: "Vin_Diesel" },
    { title: "Джейсон Стэйтем", link: "https://www.imdb.com/find/?q=Jason+Statham&s=nm", svc: "imdb", wiki: "Jason_Statham" },
    { title: "Идрис Эльба", link: "https://www.imdb.com/find/?q=Idris+Elba&s=nm", svc: "imdb", wiki: "Idris_Elba" },
    { title: "Майкл Фассбендер", link: "https://www.imdb.com/find/?q=Michael+Fassbender&s=nm", svc: "imdb", wiki: "Michael_Fassbender" },
    { title: "Джейк Джилленхол", link: "https://www.imdb.com/find/?q=Jake+Gyllenhaal&s=nm", svc: "imdb", wiki: "Jake_Gyllenhaal" },
    { title: "Эдвард Нортон", link: "https://www.imdb.com/find/?q=Edward+Norton&s=nm", svc: "imdb", wiki: "Edward_Norton" },
    { title: "Мэтт Дэймон", link: "https://www.imdb.com/find/?q=Matt+Damon&s=nm", svc: "imdb", wiki: "Matt_Damon" },
    { title: "Бен Аффлек", link: "https://www.imdb.com/find/?q=Ben+Affleck&s=nm", svc: "imdb", wiki: "Ben_Affleck" },
    { title: "Шон Пенн", link: "https://www.imdb.com/find/?q=Sean+Penn&s=nm", svc: "imdb", wiki: "Sean_Penn" },
    { title: "Кевин Спейси", link: "https://www.imdb.com/find/?q=Kevin+Spacey&s=nm", svc: "imdb", wiki: "Kevin_Spacey" },
    { title: "Рассел Кроу", link: "https://www.imdb.com/find/?q=Russell+Crowe&s=nm", svc: "imdb", wiki: "Russell_Crowe" },
    { title: "Лиам Нисон", link: "https://www.imdb.com/find/?q=Liam+Neeson&s=nm", svc: "imdb", wiki: "Liam_Neeson" },
    { title: "Пирс Броснан", link: "https://www.imdb.com/find/?q=Pierce+Brosnan&s=nm", svc: "imdb", wiki: "Pierce_Brosnan" },
    { title: "Дэниэл Крэйг", link: "https://www.imdb.com/find/?q=Daniel+Craig&s=nm", svc: "imdb", wiki: "Daniel_Craig" },
    { title: "Колин Фёрт", link: "https://www.imdb.com/find/?q=Colin+Firth&s=nm", svc: "imdb", wiki: "Colin_Firth" },
    { title: "Хью Грант", link: "https://www.imdb.com/find/?q=Hugh+Grant&s=nm", svc: "imdb", wiki: "Hugh_Grant" },
    { title: "Рэйф Файнс", link: "https://www.imdb.com/find/?q=Ralph+Fiennes&s=nm", svc: "imdb", wiki: "Ralph_Fiennes" },
    { title: "Уиллем Дефо", link: "https://www.imdb.com/find/?q=Willem+Dafoe&s=nm", svc: "imdb", wiki: "Willem_Dafoe" },
    { title: "Хавьер Бардем", link: "https://www.imdb.com/find/?q=Javier+Bardem&s=nm", svc: "imdb", wiki: "Javier_Bardem" },
    { title: "Антонио Бандерас", link: "https://www.imdb.com/find/?q=Antonio+Banderas&s=nm", svc: "imdb", wiki: "Antonio_Banderas" },
    { title: "Пенелопа Крус", link: "https://www.imdb.com/find/?q=Penelope+Cruz&s=nm", svc: "imdb", wiki: "Penélope_Cruz" },
    { title: "Сальма Хайек", link: "https://www.imdb.com/find/?q=Salma+Hayek&s=nm", svc: "imdb", wiki: "Salma_Hayek" },
    { title: "Ева Грин", link: "https://www.imdb.com/find/?q=Eva+Green&s=nm", svc: "imdb", wiki: "Eva_Green" },
    { title: "Рэйчел Вайс", link: "https://www.imdb.com/find/?q=Rachel+Weisz&s=nm", svc: "imdb", wiki: "Rachel_Weisz" },
    { title: "Кейт Уинслет", link: "https://www.imdb.com/find/?q=Kate+Winslet&s=nm", svc: "imdb", wiki: "Kate_Winslet" },
    { title: "Эмили Блант", link: "https://www.imdb.com/find/?q=Emily+Blunt&s=nm", svc: "imdb", wiki: "Emily_Blunt" },
    { title: "Аманда Сайфрид", link: "https://www.imdb.com/find/?q=Amanda+Seyfried&s=nm", svc: "imdb", wiki: "Amanda_Seyfried" },
    { title: "Блейк Лайвли", link: "https://www.imdb.com/find/?q=Blake+Lively&s=nm", svc: "imdb", wiki: "Blake_Lively" },
    { title: "Галь Гадот", link: "https://www.imdb.com/find/?q=Gal+Gadot&s=nm", svc: "imdb", wiki: "Gal_Gadot" },
    { title: "Элизабет Олсен", link: "https://www.imdb.com/find/?q=Elizabeth+Olsen&s=nm", svc: "imdb", wiki: "Elizabeth_Olsen" },
    { title: "Бри Ларсон", link: "https://www.imdb.com/find/?q=Brie+Larson&s=nm", svc: "imdb", wiki: "Brie_Larson" },
    { title: "Милла Йовович", link: "https://www.imdb.com/find/?q=Milla+Jovovich&s=nm", svc: "imdb", wiki: "Milla_Jovovich" },
    { title: "Ума Турман", link: "https://www.imdb.com/find/?q=Uma+Thurman&s=nm", svc: "imdb", wiki: "Uma_Thurman" },
    { title: "Кэмерон Диаз", link: "https://www.imdb.com/find/?q=Cameron+Diaz&s=nm", svc: "imdb", wiki: "Cameron_Diaz" },
    { title: "Дрю Бэрримор", link: "https://www.imdb.com/find/?q=Drew+Barrymore&s=nm", svc: "imdb", wiki: "Drew_Barrymore" },
    { title: "Дженнифер Энистон", link: "https://www.imdb.com/find/?q=Jennifer+Aniston&s=nm", svc: "imdb", wiki: "Jennifer_Aniston" },
    { title: "Джулианна Мур", link: "https://www.imdb.com/find/?q=Julianne+Moore&s=nm", svc: "imdb", wiki: "Julianne_Moore" },
    { title: "Наоми Уоттс", link: "https://www.imdb.com/find/?q=Naomi+Watts&s=nm", svc: "imdb", wiki: "Naomi_Watts" },
    { title: "Холли Берри", link: "https://www.imdb.com/find/?q=Halle+Berry&s=nm", svc: "imdb", wiki: "Halle_Berry" },
    { title: "Зои Салдана", link: "https://www.imdb.com/find/?q=Zoe+Saldana&s=nm", svc: "imdb", wiki: "Zoe_Saldana" },
    { title: "Мишель Родригес", link: "https://www.imdb.com/find/?q=Michelle+Rodriguez&s=nm", svc: "imdb", wiki: "Michelle_Rodriguez" },
    { title: "Джессика Альба", link: "https://www.imdb.com/find/?q=Jessica+Alba&s=nm", svc: "imdb", wiki: "Jessica_Alba" },
    { title: "Меган Фокс", link: "https://www.imdb.com/find/?q=Megan+Fox&s=nm", svc: "imdb", wiki: "Megan_Fox" },
    { title: "Аня Тейлор-Джой", link: "https://www.imdb.com/find/?q=Anya+Taylor-Joy&s=nm", svc: "imdb", wiki: "Anya_Taylor-Joy" },
    { title: "Сидни Суини", link: "https://www.imdb.com/find/?q=Sydney+Sweeney&s=nm", svc: "imdb", wiki: "Sydney_Sweeney" },
    { title: "Ана де Армас", link: "https://www.imdb.com/find/?q=Ana+de+Armas&s=nm", svc: "imdb", wiki: "Ana_de_Armas" },
    { title: "Пол Радд", link: "https://www.imdb.com/find/?q=Paul+Rudd&s=nm", svc: "imdb", wiki: "Paul_Rudd" },
    { title: "Крис Пайн", link: "https://www.imdb.com/find/?q=Chris+Pine&s=nm", svc: "imdb", wiki: "Chris_Pine" },
    { title: "Аарон Пол", link: "https://www.imdb.com/find/?q=Aaron+Paul&s=nm", svc: "imdb", wiki: "Aaron_Paul" },
    { title: "Брайан Крэнстон", link: "https://www.imdb.com/find/?q=Bryan+Cranston&s=nm", svc: "imdb", wiki: "Bryan_Cranston" },
    { title: "Вуди Харрельсон", link: "https://www.imdb.com/find/?q=Woody+Harrelson&s=nm", svc: "imdb", wiki: "Woody_Harrelson" },
    { title: "Оуэн Уилсон", link: "https://www.imdb.com/find/?q=Owen+Wilson&s=nm", svc: "imdb", wiki: "Owen_Wilson" },
    { title: "Бен Стиллер", link: "https://www.imdb.com/find/?q=Ben+Stiller&s=nm", svc: "imdb", wiki: "Ben_Stiller" },
    { title: "Стив Карелл", link: "https://www.imdb.com/find/?q=Steve+Carell&s=nm", svc: "imdb", wiki: "Steve_Carell" },
    { title: "Уилл Феррелл", link: "https://www.imdb.com/find/?q=Will+Ferrell&s=nm", svc: "imdb", wiki: "Will_Ferrell" },
    { title: "Джим Керри", link: "https://www.imdb.com/find/?q=Jim+Carrey&s=nm", svc: "imdb", wiki: "Jim_Carrey" },
    { title: "Адам Сэндлер", link: "https://www.imdb.com/find/?q=Adam+Sandler&s=nm", svc: "imdb", wiki: "Adam_Sandler" },
    { title: "Эдди Мёрфи", link: "https://www.imdb.com/find/?q=Eddie+Murphy&s=nm", svc: "imdb", wiki: "Eddie_Murphy" },
    { title: "Кевин Харт", link: "https://www.imdb.com/find/?q=Kevin+Hart&s=nm", svc: "imdb", wiki: "Kevin_Hart" },
    { title: "Робин Уильямс", link: "https://www.imdb.com/find/?q=Robin+Williams&s=nm", svc: "imdb", wiki: "Robin_Williams" },
    { title: "Джейми Фокс", link: "https://www.imdb.com/find/?q=Jamie+Foxx&s=nm", svc: "imdb", wiki: "Jamie_Foxx" },
    { title: "Форест Уитакер", link: "https://www.imdb.com/find/?q=Forest+Whitaker&s=nm", svc: "imdb", wiki: "Forest_Whitaker" },
    { title: "Майкл Б. Джордан", link: "https://www.imdb.com/find/?q=Michael+B+Jordan&s=nm", svc: "imdb", wiki: "Michael_B._Jordan" },
    { title: "Чедвик Боузман", link: "https://www.imdb.com/find/?q=Chadwick+Boseman&s=nm", svc: "imdb", wiki: "Chadwick_Boseman" },
    { title: "Дон Чидл", link: "https://www.imdb.com/find/?q=Don+Cheadle&s=nm", svc: "imdb", wiki: "Don_Cheadle" },
    { title: "Махершала Али", link: "https://www.imdb.com/find/?q=Mahershala+Ali&s=nm", svc: "imdb", wiki: "Mahershala_Ali" },
    { title: "Джон Бойега", link: "https://www.imdb.com/find/?q=John+Boyega&s=nm", svc: "imdb", wiki: "John_Boyega" },
    { title: "Дэниэл Калуя", link: "https://www.imdb.com/find/?q=Daniel+Kaluuya&s=nm", svc: "imdb", wiki: "Daniel_Kaluuya" },
    { title: "Люпита Нионго", link: "https://www.imdb.com/find/?q=Lupita+Nyongo&s=nm", svc: "imdb", wiki: "Lupita_Nyong'o" },
    { title: "Лоуренс Фишбёрн", link: "https://www.imdb.com/find/?q=Laurence+Fishburne&s=nm", svc: "imdb", wiki: "Laurence_Fishburne" },
    { title: "Кэрри-Энн Мосс", link: "https://www.imdb.com/find/?q=Carrie-Anne+Moss&s=nm", svc: "imdb", wiki: "Carrie-Anne_Moss" },
    { title: "Хьюго Уивинг", link: "https://www.imdb.com/find/?q=Hugo+Weaving&s=nm", svc: "imdb", wiki: "Hugo_Weaving" },
    { title: "Иэн Маккеллен", link: "https://www.imdb.com/find/?q=Ian+McKellen&s=nm", svc: "imdb", wiki: "Ian_McKellen" },
    { title: "Элайджа Вуд", link: "https://www.imdb.com/find/?q=Elijah+Wood&s=nm", svc: "imdb", wiki: "Elijah_Wood" },
    { title: "Орландо Блум", link: "https://www.imdb.com/find/?q=Orlando+Bloom&s=nm", svc: "imdb", wiki: "Orlando_Bloom" },
    { title: "Вигго Мортенсен", link: "https://www.imdb.com/find/?q=Viggo+Mortensen&s=nm", svc: "imdb", wiki: "Viggo_Mortensen" },
    { title: "Шон Бин", link: "https://www.imdb.com/find/?q=Sean+Bean&s=nm", svc: "imdb", wiki: "Sean_Bean" },
    { title: "Алан Рикман", link: "https://www.imdb.com/find/?q=Alan+Rickman&s=nm", svc: "imdb", wiki: "Alan_Rickman" },
    { title: "Дэниэл Рэдклифф", link: "https://www.imdb.com/find/?q=Daniel+Radcliffe&s=nm", svc: "imdb", wiki: "Daniel_Radcliffe" },
    { title: "Руперт Гринт", link: "https://www.imdb.com/find/?q=Rupert+Grint&s=nm", svc: "imdb", wiki: "Rupert_Grint" },
    { title: "Роберт Паттинсон", link: "https://www.imdb.com/find/?q=Robert+Pattinson&s=nm", svc: "imdb", wiki: "Robert_Pattinson" },
    { title: "Кристен Стюарт", link: "https://www.imdb.com/find/?q=Kristen+Stewart&s=nm", svc: "imdb", wiki: "Kristen_Stewart" },
    { title: "Закари Эфрон", link: "https://www.imdb.com/find/?q=Zac+Efron&s=nm", svc: "imdb", wiki: "Zac_Efron" },
    { title: "Селена Гомес", link: "https://www.imdb.com/find/?q=Selena+Gomez&s=nm", svc: "imdb", wiki: "Selena_Gomez" },
    { title: "Дакота Джонсон", link: "https://www.imdb.com/find/?q=Dakota+Johnson&s=nm", svc: "imdb", wiki: "Dakota_Johnson" },
    { title: "Генри Кавилл", link: "https://www.imdb.com/find/?q=Henry+Cavill&s=nm", svc: "imdb", wiki: "Henry_Cavill" },
    { title: "Бен Кингсли", link: "https://www.imdb.com/find/?q=Ben+Kingsley&s=nm", svc: "imdb", wiki: "Ben_Kingsley" },
    { title: "Майкл Кейн", link: "https://www.imdb.com/find/?q=Michael+Caine&s=nm", svc: "imdb", wiki: "Michael_Caine" },
    { title: "Патрик Стюарт", link: "https://www.imdb.com/find/?q=Patrick+Stewart&s=nm", svc: "imdb", wiki: "Patrick_Stewart" },
    { title: "Тильда Суинтон", link: "https://www.imdb.com/find/?q=Tilda+Swinton&s=nm", svc: "imdb", wiki: "Tilda_Swinton" },
    { title: "Крис Рок", link: "https://www.imdb.com/find/?q=Chris+Rock&s=nm", svc: "imdb", wiki: "Chris_Rock" },
    { title: "Джон Красински", link: "https://www.imdb.com/find/?q=John+Krasinski&s=nm", svc: "imdb", wiki: "John_Krasinski" }
  ],

  // ФИКС 22: новые категории шаблонов. Фото берётся через тот же надёжный механизм,
  // что и у актёров (поиск по Wikipedia), поэтому так же устойчиво к обрывам ссылок.
  musicians: [
    { title: "Майкл Джексон", link: "https://www.imdb.com/find/?q=Michael+Jackson&s=nm", svc: "imdb", wiki: "Michael_Jackson" },
    { title: "Элвис Пресли", link: "https://www.imdb.com/find/?q=Elvis+Presley&s=nm", svc: "imdb", wiki: "Elvis_Presley" },
    { title: "Фредди Меркьюри", link: "https://www.imdb.com/find/?q=Freddie+Mercury&s=nm", svc: "imdb", wiki: "Freddie_Mercury" },
    { title: "Боб Марли", link: "https://www.imdb.com/find/?q=Bob+Marley&s=nm", svc: "imdb", wiki: "Bob_Marley" },
    { title: "Мадонна", link: "https://www.imdb.com/find/?q=Madonna&s=nm", svc: "imdb", wiki: "Madonna" },
    { title: "Бейонсе", link: "https://www.imdb.com/find/?q=Beyonce&s=nm", svc: "imdb", wiki: "Beyoncé" },
    { title: "Рианна", link: "https://www.imdb.com/find/?q=Rihanna&s=nm", svc: "imdb", wiki: "Rihanna" },
    { title: "Тейлор Свифт", link: "https://www.imdb.com/find/?q=Taylor+Swift&s=nm", svc: "imdb", wiki: "Taylor_Swift" },
    { title: "Эд Ширан", link: "https://www.imdb.com/find/?q=Ed+Sheeran&s=nm", svc: "imdb", wiki: "Ed_Sheeran" },
    { title: "Адель", link: "https://www.imdb.com/find/?q=Adele&s=nm", svc: "imdb", wiki: "Adele" },
    { title: "Эминем", link: "https://www.imdb.com/find/?q=Eminem&s=nm", svc: "imdb", wiki: "Eminem" },
    { title: "Дрейк", link: "https://www.imdb.com/find/?q=Drake&s=nm", svc: "imdb", wiki: "Drake_(musician)" },
    { title: "Кендрик Ламар", link: "https://www.imdb.com/find/?q=Kendrick+Lamar&s=nm", svc: "imdb", wiki: "Kendrick_Lamar" },
    { title: "Джей-Зи", link: "https://www.imdb.com/find/?q=Jay-Z&s=nm", svc: "imdb", wiki: "Jay-Z" },
    { title: "Канье Уэст", link: "https://www.imdb.com/find/?q=Kanye+West&s=nm", svc: "imdb", wiki: "Kanye_West" },
    { title: "Леди Гага", link: "https://www.imdb.com/find/?q=Lady+Gaga&s=nm", svc: "imdb", wiki: "Lady_Gaga" },
    { title: "Билли Айлиш", link: "https://www.imdb.com/find/?q=Billie+Eilish&s=nm", svc: "imdb", wiki: "Billie_Eilish" },
    { title: "Ариана Гранде", link: "https://www.imdb.com/find/?q=Ariana+Grande&s=nm", svc: "imdb", wiki: "Ariana_Grande" },
    { title: "Джон Леннон", link: "https://www.imdb.com/find/?q=John+Lennon&s=nm", svc: "imdb", wiki: "John_Lennon" },
    { title: "Дэвид Боуи", link: "https://www.imdb.com/find/?q=David+Bowie&s=nm", svc: "imdb", wiki: "David_Bowie" },
    { title: "Курт Кобейн", link: "https://www.imdb.com/find/?q=Kurt+Cobain&s=nm", svc: "imdb", wiki: "Kurt_Cobain" },
    { title: "Эми Уайнхаус", link: "https://www.imdb.com/find/?q=Amy+Winehouse&s=nm", svc: "imdb", wiki: "Amy_Winehouse" },
    { title: "Уитни Хьюстон", link: "https://www.imdb.com/find/?q=Whitney+Houston&s=nm", svc: "imdb", wiki: "Whitney_Houston" },
    { title: "Стиви Уандер", link: "https://www.imdb.com/find/?q=Stevie+Wonder&s=nm", svc: "imdb", wiki: "Stevie_Wonder" },
    { title: "Элтон Джон", link: "https://www.imdb.com/find/?q=Elton+John&s=nm", svc: "imdb", wiki: "Elton_John" },
    { title: "Шакира", link: "https://www.imdb.com/find/?q=Shakira&s=nm", svc: "imdb", wiki: "Shakira" }
  ],

  athletes: [
    { title: "Криштиану Роналду", link: "https://www.imdb.com/find/?q=Cristiano+Ronaldo&s=nm", svc: "imdb", wiki: "Cristiano_Ronaldo" },
    { title: "Лионель Месси", link: "https://www.imdb.com/find/?q=Lionel+Messi&s=nm", svc: "imdb", wiki: "Lionel_Messi" },
    { title: "Леброн Джеймс", link: "https://www.imdb.com/find/?q=LeBron+James&s=nm", svc: "imdb", wiki: "LeBron_James" },
    { title: "Майкл Джордан", link: "https://www.imdb.com/find/?q=Michael+Jordan&s=nm", svc: "imdb", wiki: "Michael_Jordan" },
    { title: "Усэйн Болт", link: "https://www.imdb.com/find/?q=Usain+Bolt&s=nm", svc: "imdb", wiki: "Usain_Bolt" },
    { title: "Роджер Федерер", link: "https://www.imdb.com/find/?q=Roger+Federer&s=nm", svc: "imdb", wiki: "Roger_Federer" },
    { title: "Рафаэль Надаль", link: "https://www.imdb.com/find/?q=Rafael+Nadal&s=nm", svc: "imdb", wiki: "Rafael_Nadal" },
    { title: "Новак Джокович", link: "https://www.imdb.com/find/?q=Novak+Djokovic&s=nm", svc: "imdb", wiki: "Novak_Djokovic" },
    { title: "Майк Тайсон", link: "https://www.imdb.com/find/?q=Mike+Tyson&s=nm", svc: "imdb", wiki: "Mike_Tyson" },
    { title: "Мохаммед Али", link: "https://www.imdb.com/find/?q=Muhammad+Ali&s=nm", svc: "imdb", wiki: "Muhammad_Ali" },
    { title: "Коби Брайант", link: "https://www.imdb.com/find/?q=Kobe+Bryant&s=nm", svc: "imdb", wiki: "Kobe_Bryant" },
    { title: "Серена Уильямс", link: "https://www.imdb.com/find/?q=Serena+Williams&s=nm", svc: "imdb", wiki: "Serena_Williams" },
    { title: "Майкл Фелпс", link: "https://www.imdb.com/find/?q=Michael+Phelps&s=nm", svc: "imdb", wiki: "Michael_Phelps" },
    { title: "Диего Марадона", link: "https://www.imdb.com/find/?q=Diego+Maradona&s=nm", svc: "imdb", wiki: "Diego_Maradona" },
    { title: "Пеле", link: "https://www.imdb.com/find/?q=Pele&s=nm", svc: "imdb", wiki: "Pelé" },
    { title: "Дэвид Бекхэм", link: "https://www.imdb.com/find/?q=David+Beckham&s=nm", svc: "imdb", wiki: "David_Beckham" },
    { title: "Неймар", link: "https://www.imdb.com/find/?q=Neymar&s=nm", svc: "imdb", wiki: "Neymar" },
    { title: "Килиан Мбаппе", link: "https://www.imdb.com/find/?q=Kylian+Mbappe&s=nm", svc: "imdb", wiki: "Kylian_Mbappé" },
    { title: "Стефен Карри", link: "https://www.imdb.com/find/?q=Stephen+Curry&s=nm", svc: "imdb", wiki: "Stephen_Curry" },
    { title: "Конор Макгрегор", link: "https://www.imdb.com/find/?q=Conor+McGregor&s=nm", svc: "imdb", wiki: "Conor_McGregor" },
    { title: "Хабиб Нурмагомедов", link: "https://www.imdb.com/find/?q=Khabib+Nurmagomedov&s=nm", svc: "imdb", wiki: "Khabib_Nurmagomedov" },
    { title: "Льюис Хэмилтон", link: "https://www.imdb.com/find/?q=Lewis+Hamilton&s=nm", svc: "imdb", wiki: "Lewis_Hamilton" },
    { title: "Майкл Шумахер", link: "https://www.imdb.com/find/?q=Michael+Schumacher&s=nm", svc: "imdb", wiki: "Michael_Schumacher" },
    { title: "Симона Байлз", link: "https://www.imdb.com/find/?q=Simone+Biles&s=nm", svc: "imdb", wiki: "Simone_Biles" },
    { title: "Тайгер Вудс", link: "https://www.imdb.com/find/?q=Tiger+Woods&s=nm", svc: "imdb", wiki: "Tiger_Woods" },
    { title: "Александр Овечкин", link: "https://www.imdb.com/find/?q=Alexander+Ovechkin&s=nm", svc: "imdb", wiki: "Alexander_Ovechkin" }
  ],

  bloggers: [
    { title: "PewDiePie", link: "https://www.imdb.com/find/?q=PewDiePie&s=nm", svc: "imdb", wiki: "PewDiePie" },
    { title: "MrBeast", link: "https://www.imdb.com/find/?q=MrBeast&s=nm", svc: "imdb", wiki: "MrBeast" },
    { title: "Логан Пол", link: "https://www.imdb.com/find/?q=Logan+Paul&s=nm", svc: "imdb", wiki: "Logan_Paul" },
    { title: "Джейк Пол", link: "https://www.imdb.com/find/?q=Jake+Paul&s=nm", svc: "imdb", wiki: "Jake_Paul" },
    { title: "Ninja", link: "https://www.imdb.com/find/?q=Ninja+gamer&s=nm", svc: "imdb", wiki: "Ninja_(gamer)" },
    { title: "Markiplier", link: "https://www.imdb.com/find/?q=Markiplier&s=nm", svc: "imdb", wiki: "Markiplier" },
    { title: "KSI", link: "https://www.imdb.com/find/?q=KSI&s=nm", svc: "imdb", wiki: "KSI_(YouTuber)" },
    { title: "Emma Chamberlain", link: "https://www.imdb.com/find/?q=Emma+Chamberlain&s=nm", svc: "imdb", wiki: "Emma_Chamberlain" },
    { title: "Casey Neistat", link: "https://www.imdb.com/find/?q=Casey+Neistat&s=nm", svc: "imdb", wiki: "Casey_Neistat" },
    { title: "David Dobrik", link: "https://www.imdb.com/find/?q=David+Dobrik&s=nm", svc: "imdb", wiki: "David_Dobrik" },
    { title: "Lilly Singh", link: "https://www.imdb.com/find/?q=Lilly+Singh&s=nm", svc: "imdb", wiki: "Lilly_Singh" },
    { title: "Shane Dawson", link: "https://www.imdb.com/find/?q=Shane+Dawson&s=nm", svc: "imdb", wiki: "Shane_Dawson" },
    { title: "Jenna Marbles", link: "https://www.imdb.com/find/?q=Jenna+Marbles&s=nm", svc: "imdb", wiki: "Jenna_Marbles" },
    { title: "Zoella", link: "https://www.imdb.com/find/?q=Zoe+Sugg&s=nm", svc: "imdb", wiki: "Zoe_Sugg" },
    { title: "xQc", link: "https://www.imdb.com/find/?q=Felix+Lengyel&s=nm", svc: "imdb", wiki: "Félix_Lengyel" },
    { title: "Pokimane", link: "https://www.imdb.com/find/?q=Imane+Anys&s=nm", svc: "imdb", wiki: "Imane_Anys" },
    { title: "Ludwig", link: "https://www.imdb.com/find/?q=Ludwig+Ahgren&s=nm", svc: "imdb", wiki: "Ludwig_Ahgren" },
    { title: "Dude Perfect", link: "https://www.imdb.com/find/?q=Dude+Perfect&s=nm", svc: "imdb", wiki: "Dude_Perfect" }
  ],

  anime: [
    { title: "Наруто", link: "https://www.imdb.com/find/?q=Naruto&s=tt", svc: "imdb", wiki: "Naruto" },
    { title: "Ван-Пис", link: "https://www.imdb.com/find/?q=One+Piece&s=tt", svc: "imdb", wiki: "One_Piece" },
    { title: "Атака Титанов", link: "https://www.imdb.com/find/?q=Attack+on+Titan&s=tt", svc: "imdb", wiki: "Attack_on_Titan" },
    { title: "Клинок, рассекающий демонов", link: "https://www.imdb.com/find/?q=Demon+Slayer&s=tt", svc: "imdb", wiki: "Demon_Slayer:_Kimetsu_no_Yaiba" },
    { title: "Моя геройская академия", link: "https://www.imdb.com/find/?q=My+Hero+Academia&s=tt", svc: "imdb", wiki: "My_Hero_Academia" },
    { title: "Тетрадь смерти", link: "https://www.imdb.com/find/?q=Death+Note&s=tt", svc: "imdb", wiki: "Death_Note" },
    { title: "Стальной алхимик: Братство", link: "https://www.imdb.com/find/?q=Fullmetal+Alchemist+Brotherhood&s=tt", svc: "imdb", wiki: "Fullmetal_Alchemist:_Brotherhood" },
    { title: "Токийский гуль", link: "https://www.imdb.com/find/?q=Tokyo+Ghoul&s=tt", svc: "imdb", wiki: "Tokyo_Ghoul" },
    { title: "Хвост Феи", link: "https://www.imdb.com/find/?q=Fairy+Tail&s=tt", svc: "imdb", wiki: "Fairy_Tail" },
    { title: "Драконий жемчуг", link: "https://www.imdb.com/find/?q=Dragon+Ball&s=tt", svc: "imdb", wiki: "Dragon_Ball" },
    { title: "Блич", link: "https://www.imdb.com/find/?q=Bleach&s=tt", svc: "imdb", wiki: "Bleach_(manga)" },
    { title: "Евангелион", link: "https://www.imdb.com/find/?q=Neon+Genesis+Evangelion&s=tt", svc: "imdb", wiki: "Neon_Genesis_Evangelion" },
    { title: "Магическая битва", link: "https://www.imdb.com/find/?q=Jujutsu+Kaisen&s=tt", svc: "imdb", wiki: "Jujutsu_Kaisen" },
    { title: "Человек-бензопила", link: "https://www.imdb.com/find/?q=Chainsaw+Man&s=tt", svc: "imdb", wiki: "Chainsaw_Man" },
    { title: "Психопаспорт", link: "https://www.imdb.com/find/?q=Psycho-Pass&s=tt", svc: "imdb", wiki: "Psycho-Pass" },
    { title: "Ковбой Бибоп", link: "https://www.imdb.com/find/?q=Cowboy+Bebop&s=tt", svc: "imdb", wiki: "Cowboy_Bebop" },
    { title: "Берсерк", link: "https://www.imdb.com/find/?q=Berserk&s=tt", svc: "imdb", wiki: "Berserk_(manga)" },
    { title: "Ванпанчмен", link: "https://www.imdb.com/find/?q=One-Punch+Man&s=tt", svc: "imdb", wiki: "One-Punch_Man" },
    { title: "Семь смертных грехов", link: "https://www.imdb.com/find/?q=The+Seven+Deadly+Sins&s=tt", svc: "imdb", wiki: "The_Seven_Deadly_Sins_(manga)" },
    { title: "Сага о Винланде", link: "https://www.imdb.com/find/?q=Vinland+Saga&s=tt", svc: "imdb", wiki: "Vinland_Saga" }
  ]
};

let currentPoolItems = [];

function pImg(svc) {
  const c = { youtube: '#ff0000', spotify: '#1db954', apple: '#fc3c44', yandex: '#ffcc00', steam: '#171a21', imdb: '#f5c518' };
  const i = { youtube: '▶', spotify: '●', apple: '♫', yandex: '♪', steam: '🎮', imdb: '🎬' };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="${c[svc] || '#555'}" width="64" height="64" rx="8"/><text fill="white" x="32" y="36" text-anchor="middle" font-size="20">${i[svc] || '?'}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// ФИКС КАРТИНОК: постер фильма/сериала по IMDb id — бесплатный CDN без ключа.
// Раньше был только ОДИН источник картинки (images.metahub.space). Если этот сервис
// временно недоступен/перегружен — постер просто не загружался, показывалась только
// цветная заглушка-иконка. Теперь у каждой картинки есть запасной "зеркальный" адрес
// (см. imgOnErrorAttr ниже), и если первый сервер не ответил — браузер сам попробует второй.
function imdbId(link) {
  const m = (link || '').match(/tt\d+/);
  return m ? m[0] : null;
}
function imdbPoster(link) {
  const id = imdbId(link);
  return id ? `https://images.metahub.space/poster/small/${id}/img` : null;
}
function imdbPosterMirror(link) {
  const id = imdbId(link);
  return id ? `https://live.metahub.space/poster/small/${id}/img` : null;
}
// Строка для атрибута onerror у <img>: используется только для НЕ-imdb карточек
// (steam и т.д. — там достаточно одной заглушки, третий уровень им не нужен).
function simpleOnErrorAttr(svc) {
  return `this.onerror=null;this.src='${pImg(svc)}';`;
}

// ФИКС КАРТИНОК (последние ~10%): поиск обложки через открытое Wikipedia API по НАЗВАНИЮ.
// Используется как третья, последняя попытка для фильмов/сериалов, если оба CDN-зеркала
// не ответили — а также для авто-поиска картинки, когда пользователь добавляет свой фильм.
export async function searchWikiThumbnail(title) {
  if (!title) return null;
  const cacheKey = 'wiki_thumb_' + title.toLowerCase();
  const cached = sg(cacheKey, null);
  if (cached) return cached;
  try {
    const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(title)}&limit=1&namespace=0&format=json&origin=*`);
    if (!searchRes.ok) throw new Error('search failed');
    const searchData = await searchRes.json();
    const pageTitle = searchData && searchData[1] && searchData[1][0];
    if (!pageTitle) return null;
    const sumRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`);
    if (!sumRes.ok) throw new Error('summary failed');
    const sumData = await sumRes.json();
    const url = (sumData.thumbnail && sumData.thumbnail.source) ? sumData.thumbnail.source : null;
    if (url) ss(cacheKey, url);
    return url;
  } catch (e) {
    return null;
  }
}

// ФИКС КАРТИНОК: трёхступенчатый фолбэк для постера (imdb): основной CDN → зеркало →
// поиск по названию в Wikipedia → и только если совсем ничего не нашлось — заглушка.
// Экспортируется, чтобы этой же логикой пользовался ui/render.js для карточек,
// которые уже лежат в тир-листе (не только в пуле шаблонов).
export function attachPosterFallback(imgEl, item) {
  imgEl.addEventListener('error', async function handler() {
    const stage = this.dataset.stage || '0';
    if (stage === '0') {
      this.dataset.stage = '1';
      const mirror = imdbPosterMirror(item.url);
      if (mirror) { this.src = mirror; return; }
    }
    if (stage === '0' || stage === '1') {
      this.dataset.stage = '2';
      const wikiUrl = await searchWikiThumbnail(item.title);
      if (wikiUrl) { this.src = wikiUrl; item.img = wikiUrl; return; }
    }
    this.removeEventListener('error', handler);
    this.onerror = null;
    this.src = pImg(item.svc);
  });
}

// ФИКС КАРТИНОК: официальная обложка игры по appid из ссылки Steam — бесплатный CDN без ключа
function steamHeader(link) {
  const m = (link || '').match(/\/app\/(\d+)/);
  return m ? `https://cdn.akamai.steamstatic.com/steam/apps/${m[1]}/header.jpg` : null;
}

// ФИКС КАРТИНОК: фото актёра через открытое Wikipedia API (без ключа), с кэшем в localStorage
async function resolveActorPhoto(wikiSlug) {
  if (!wikiSlug) return null;
  const cacheKey = 'actor_photo_' + wikiSlug;
  // ФИКС: раньше при неудаче (нет сети/Wikipedia не ответила) результат "нет фото"
  // сохранялся в localStorage НАВСЕГДА — фото этого актёра переставало грузиться
  // для пользователя навечно, даже если проблема была временной. Теперь кэшируем
  // только УСПЕШНЫЙ результат, а неудачу всегда пробуем повторить при следующей загрузке.
  const cached = sg(cacheKey, null);
  if (cached) return cached;
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiSlug)}`);
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    const url = (data.thumbnail && data.thumbnail.source) ? data.thumbnail.source : null;
    if (url) ss(cacheKey, url);
    return url;
  } catch (e) {
    return null;
  }
}

// Догружает реальные фото актёров в уже отрисованный пул (плейсхолдер меняется на фото, когда оно готово).
// ФИКС: раньше запускались ВСЕ запросы к Wikipedia одновременно (до 100 штук разом на шаблон
// "Актёры") — публичный API часто отвечал не всем из-за одновременной нагрузки, и часть фото
// просто не подгружалась. Теперь запросы идут пачками по 6, это надёжнее.
async function hydrateActorPhotos() {
  const withWiki = currentPoolItems.map((item, idx) => ({ item, idx })).filter(x => x.item.wiki);
  const BATCH_SIZE = 6;
  for (let i = 0; i < withWiki.length; i += BATCH_SIZE) {
    const batch = withWiki.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async ({ item, idx }) => {
      const url = await resolveActorPhoto(item.wiki);
      if (!url) return;
      const imgEl = document.querySelector('#templatePool [data-item-index="' + idx + '"] img');
      if (imgEl) imgEl.src = url;
      item.img = url;
    }));
  }
}

// ФИКС АВТО-ПОИСКА: ищем игру в официальном публичном поиске Steam по названию (без ключа).
// Возвращает картинку обложки и ссылку на страницу игры, если что-то нашлось.
async function searchSteamGame(title) {
  if (!title) return null;
  const cacheKey = 'steam_search_' + title.toLowerCase();
  const cached = sg(cacheKey, null);
  if (cached) return cached;
  try {
    const res = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(title)}&l=russian&cc=RU`);
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    const first = data.items && data.items[0];
    if (!first) return null;
    const result = { img: steamHeader('/app/' + first.id + '/'), url: 'https://store.steampowered.com/app/' + first.id + '/', title: first.name };
    ss(cacheKey, result);
    return result;
  } catch (e) {
    return null; // Скорее всего сеть/CORS — ничего страшного, останется ручной ввод
  }
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
      .map(item => {
        let img = item.img || null;
        if (!img && item.svc === 'imdb') img = imdbPoster(item.link);
        if (!img && item.svc === 'steam') img = steamHeader(item.link);
        return {
          img: img || pImg(item.svc),
          url: item.link || item.url || '#',
          svc: item.svc,
          title: item.title,
          wiki: item.wiki || null
        };
      });
  }
}

export function getPoolItems() { return currentPoolItems; }

// ФИКС 23: поиск внутри шаблона. ВАЖНО: элементы не удаляются и не переставляются —
// только скрываются через CSS (display:none), иначе собьются индексы у Sortable/drag&drop,
// которые опираются на порядок карточек в DOM.
export function filterPool(query) {
  const q = (query || '').trim().toLowerCase();
  document.querySelectorAll('#templatePool .item').forEach(el => {
    const title = (el.dataset.tooltip || '').toLowerCase();
    el.classList.toggle('search-hidden', q !== '' && !title.includes(q));
  });
}

function openCustomItemModal(type) {
  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="color:var(--gold); margin-bottom: 20px;">Добавить свой элемент</h3>
    <input type="text" id="custom-title" placeholder="Название" autocomplete="off" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:10px; color:var(--text); margin-bottom:12px;" />
    <input type="text" id="custom-url" placeholder="Ссылка" autocomplete="off" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:10px; color:var(--text); margin-bottom:12px;" />
    <button class="btn btn-secondary" id="custom-find-img" style="width:100%;margin-bottom:12px;" type="button">Найти картинку по названию</button>
    <input type="text" id="custom-img" placeholder="Ссылка на картинку (можно вставить свою)" autocomplete="off" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:10px; color:var(--text);" />
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
  const titleInput = content.querySelector('#custom-title');
  const urlInput = content.querySelector('#custom-url');
  const imgInput = content.querySelector('#custom-img');
  const preview = content.querySelector('#custom-preview');
  const findBtn = content.querySelector('#custom-find-img');

  imgInput.addEventListener('input', () => {
    preview.src = imgInput.value.trim() || pImg(type === 'games' ? 'steam' : 'imdb');
  });

  // ФИКС АВТО-ПОИСКА: раньше картинку для своего фильма/игры нужно было искать и вставлять
  // вручную. Теперь стоит начать печатать название — и через секунду сайт сам попробует найти
  // подходящую обложку (для игр — через поиск Steam, для фильмов — через Wikipedia). Кнопка
  // "Найти картинку" и поле "Ссылка на картинку" остаются — можно исправить вручную в любой момент.
  async function autoFindImage(showToastIfEmpty) {
    const title = titleInput.value.trim();
    if (!title) { if (showToastIfEmpty) eventBus.emit('toast:show', { text: 'Сначала введите название', type: 'info' }); return; }
    if (imgInput.value.trim() && !showToastIfEmpty) return; // не перезаписываем то, что уже нашли/вставили

    findBtn.disabled = true;
    findBtn.textContent = 'Ищу...';
    let found = null;
    if (type === 'games') {
      const game = await searchSteamGame(title);
      if (game) {
        found = game.img;
        if (!urlInput.value.trim()) urlInput.value = game.url; // подставляем и ссылку на страницу игры, если её ещё нет
      }
    } else {
      found = await searchWikiThumbnail(title);
    }
    if (found) {
      imgInput.value = found;
      preview.src = found;
    } else {
      eventBus.emit('toast:show', { text: 'Не нашлось. Вставьте ссылку на картинку вручную.', type: 'error' });
    }
    findBtn.disabled = false;
    findBtn.textContent = 'Найти картинку по названию';
  }

  findBtn.addEventListener('click', () => { imgInput.value = ''; autoFindImage(true); });

  let autoFindTimer = null;
  titleInput.addEventListener('input', () => {
    clearTimeout(autoFindTimer);
    autoFindTimer = setTimeout(() => autoFindImage(false), 800);
  });

  content.querySelector('#custom-cancel').onclick = close;
  content.querySelector('#custom-add').onclick = () => {
    const title = window.escapeHTML(titleInput.value.trim());
    const url = urlInput.value.trim() || '#';
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
      // ФИКС КАРТИНОК: для постеров (imdb) полная цепочка фолбэков вешается ниже через JS
      // (attachPosterFallback) — она умеет ходить в Wikipedia, а это невозможно сделать
      // одной строкой в HTML-атрибуте onerror.
      const onerrorAttr = item.svc === 'imdb' ? '' : `onerror="${simpleOnErrorAttr(item.svc)}"`;
      return `<div class="item style-${styleClass}" data-item-index="${idx}" data-tooltip="${item.title}">
        <a href="${item.url}" target="_blank" rel="noopener">
        <img loading="lazy" src="${item.img}" alt="${item.title}" 
             style="width:${sVal}px; height:${sVal}px;"
             ${onerrorAttr}>
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
    // ФИКС 22: раньше подгрузка фото по Wikipedia запускалась только для type==='actors'.
    // Теперь работает для ЛЮБОЙ категории, где у элементов есть поле wiki
    // (музыканты/спортсмены/блогеры используют тот же надёжный механизм).
    if (currentPoolItems.some(i => i.wiki)) hydrateActorPhotos();
    if (type === 'movies' || type === 'anime') {
      currentPoolItems.forEach((item, idx) => {
        if (item.svc !== 'imdb') return;
        const imgEl = document.querySelector('#templatePool [data-item-index="' + idx + '"] img');
        if (imgEl) attachPosterFallback(imgEl, item);
      });
    }
  }
}

eventBus.on('templates:changed', (type) => { updatePoolItems(type); renderTemplatePool(); });
eventBus.on('templates:renderPool', renderTemplatePool);
