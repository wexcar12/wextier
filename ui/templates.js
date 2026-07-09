/**
 * @module ui/templates
 * @description Шаблоны: 200 фильмов, 100 игр, 100 актёров.
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
    { title: "Побег из Шоушенка", img: "https://upload.wikimedia.org/wikipedia/ru/d/de/The_Shawshank_Redemption.jpg", link: "https://www.imdb.com/title/tt0111161/", svc: "imdb" },
    { title: "Крёстный отец", img: "https://upload.wikimedia.org/wikipedia/ru/a/aa/Godfather_1972.jpg", link: "https://www.imdb.com/title/tt0068646/", svc: "imdb" },
    { title: "Тёмный рыцарь", img: "https://upload.wikimedia.org/wikipedia/ru/e/e3/The_Dark_Knight_2008.jpg", link: "https://www.imdb.com/title/tt0468569/", svc: "imdb" },
    { title: "Крёстный отец 2", img: "https://upload.wikimedia.org/wikipedia/ru/2/26/Godfather_part_ii.jpg", link: "https://www.imdb.com/title/tt0071562/", svc: "imdb" },
    { title: "12 разгневанных мужчин", img: "https://upload.wikimedia.org/wikipedia/ru/8/8c/12_Angry_Men_1957.jpg", link: "https://www.imdb.com/title/tt0050083/", svc: "imdb" },
    { title: "Список Шиндлера", img: "https://upload.wikimedia.org/wikipedia/ru/6/65/Schindler%27s_List.jpg", link: "https://www.imdb.com/title/tt0108052/", svc: "imdb" },
    { title: "Властелин колец: Возвращение Короля", img: "https://upload.wikimedia.org/wikipedia/ru/0/0a/The_Lord_of_the_Rings_-_The_Return_of_the_King.jpg", link: "https://www.imdb.com/title/tt0167260/", svc: "imdb" },
    { title: "Криминальное чтиво", img: "https://upload.wikimedia.org/wikipedia/ru/0/0a/Pulp_Fiction_1994.jpg", link: "https://www.imdb.com/title/tt0110912/", svc: "imdb" },
    { title: "Властелин колец: Братство Кольца", img: "https://upload.wikimedia.org/wikipedia/ru/a/ab/The_Lord_of_the_Rings_The_Fellowship_of_the_Ring.jpg", link: "https://www.imdb.com/title/tt0120737/", svc: "imdb" },
    { title: "Хороший, плохой, злой", img: "https://upload.wikimedia.org/wikipedia/ru/6/6d/Good_the_Bad_and_the_Ugly.jpg", link: "https://www.imdb.com/title/tt0060196/", svc: "imdb" },
    { title: "Форрест Гамп", img: "https://upload.wikimedia.org/wikipedia/ru/6/62/Forrest_Gump.jpg", link: "https://www.imdb.com/title/tt0109830/", svc: "imdb" },
    { title: "Бойцовский клуб", img: "https://upload.wikimedia.org/wikipedia/ru/5/51/Fight_Club.jpg", link: "https://www.imdb.com/title/tt0137523/", svc: "imdb" },
    { title: "Властелин колец: Две крепости", img: "https://upload.wikimedia.org/wikipedia/ru/5/59/The_Lord_of_the_Rings_The_Two_Towers.jpg", link: "https://www.imdb.com/title/tt0167261/", svc: "imdb" },
    { title: "Начало", img: "https://upload.wikimedia.org/wikipedia/ru/b/bc/Inception_poster.jpg", link: "https://www.imdb.com/title/tt1375666/", svc: "imdb" },
    { title: "Звёздные войны: Империя наносит ответный удар", img: "https://upload.wikimedia.org/wikipedia/ru/5/50/Empire_Strikes_Back.jpg", link: "https://www.imdb.com/title/tt0080684/", svc: "imdb" },
    { title: "Матрица", img: "https://upload.wikimedia.org/wikipedia/ru/5/52/The_Matrix_-_poster.jpg", link: "https://www.imdb.com/title/tt0133093/", svc: "imdb" },
    { title: "Славные парни", img: "https://upload.wikimedia.org/wikipedia/ru/3/3e/Goodfellas.jpg", link: "https://www.imdb.com/title/tt0099685/", svc: "imdb" },
    { title: "Пролетая над гнездом кукушки", img: "https://upload.wikimedia.org/wikipedia/ru/8/8e/One_Flew_Over_the_Cuckoo%27s_Nest.jpg", link: "https://www.imdb.com/title/tt0073486/", svc: "imdb" },
    { title: "Семь", img: "https://upload.wikimedia.org/wikipedia/ru/0/0d/Seven_%28film%29_poster.jpg", link: "https://www.imdb.com/title/tt0114369/", svc: "imdb" },
    { title: "Молчание ягнят", img: "https://upload.wikimedia.org/wikipedia/ru/8/86/The_Silence_of_the_Lambs_poster.jpg", link: "https://www.imdb.com/title/tt0102926/", svc: "imdb" },
    { title: "Интерстеллар", img: "https://upload.wikimedia.org/wikipedia/ru/3/3a/Interstellar_2014.jpg", link: "https://www.imdb.com/title/tt0816692/", svc: "imdb" },
    { title: "Спасти рядового Райана", img: "https://upload.wikimedia.org/wikipedia/ru/6/6a/Saving_Private_Ryan.jpg", link: "https://www.imdb.com/title/tt0120815/", svc: "imdb" },
    { title: "Эта замечательная жизнь", img: "https://upload.wikimedia.org/wikipedia/ru/3/30/It%27s_a_Wonderful_Life.jpg", link: "https://www.imdb.com/title/tt0038650/", svc: "imdb" },
    { title: "Зелёная миля", img: "https://upload.wikimedia.org/wikipedia/ru/3/3b/The_Green_Mile.jpg", link: "https://www.imdb.com/title/tt0120689/", svc: "imdb" },
    { title: "Леон", img: "https://upload.wikimedia.org/wikipedia/ru/9/9e/Leon_poster.jpg", link: "https://www.imdb.com/title/tt0110413/", svc: "imdb" },
    { title: "Подозрительные лица", img: "https://upload.wikimedia.org/wikipedia/ru/a/a5/Usual_Suspects.jpg", link: "https://www.imdb.com/title/tt0114814/", svc: "imdb" },
    { title: "Жизнь прекрасна", img: "https://upload.wikimedia.org/wikipedia/ru/1/1e/Life_is_Beautiful.jpg", link: "https://www.imdb.com/title/tt0118799/", svc: "imdb" },
    { title: "Унесённые призраками", img: "https://upload.wikimedia.org/wikipedia/ru/8/8d/Spirited_Away.jpg", link: "https://www.imdb.com/title/tt0245429/", svc: "imdb" },
    { title: "1+1", img: "https://upload.wikimedia.org/wikipedia/ru/9/9f/The_Intouchables.jpg", link: "https://www.imdb.com/title/tt1675434/", svc: "imdb" },
    { title: "Престиж", img: "https://upload.wikimedia.org/wikipedia/ru/2/2d/The_Prestige.jpg", link: "https://www.imdb.com/title/tt0482571/", svc: "imdb" },
    { title: "Пианист", img: "https://upload.wikimedia.org/wikipedia/ru/e/e8/The_Pianist.jpg", link: "https://www.imdb.com/title/tt0253474/", svc: "imdb" },
    { title: "Гладиатор", img: "https://upload.wikimedia.org/wikipedia/ru/8/8d/Gladiator_2000.jpg", link: "https://www.imdb.com/title/tt0172495/", svc: "imdb" },
    { title: "Американская история Х", img: "https://upload.wikimedia.org/wikipedia/ru/1/11/American_History_X.jpg", link: "https://www.imdb.com/title/tt0120586/", svc: "imdb" },
    { title: "Одержимость", img: "https://upload.wikimedia.org/wikipedia/ru/2/29/Whiplash_2014.jpg", link: "https://www.imdb.com/title/tt2582802/", svc: "imdb" },
    { title: "Большой куш", img: "https://upload.wikimedia.org/wikipedia/ru/f/f8/Snatch_2000.jpg", link: "https://www.imdb.com/title/tt0208092/", svc: "imdb" },
    { title: "Джокер", img: "https://upload.wikimedia.org/wikipedia/ru/6/6e/Joker_2019.jpg", link: "https://www.imdb.com/title/tt7286456/", svc: "imdb" },
    { title: "Остров проклятых", img: "https://upload.wikimedia.org/wikipedia/ru/4/46/Shutter_Island.jpg", link: "https://www.imdb.com/title/tt1130884/", svc: "imdb" },
    { title: "Назад в будущее", img: "https://upload.wikimedia.org/wikipedia/ru/9/9d/Back_to_the_Future.jpg", link: "https://www.imdb.com/title/tt0088763/", svc: "imdb" },
    { title: "Джанго освобождённый", img: "https://upload.wikimedia.org/wikipedia/ru/8/8b/Django_Unchained.jpg", link: "https://www.imdb.com/title/tt1853728/", svc: "imdb" },
    { title: "Волк с Уолл-стрит", img: "https://upload.wikimedia.org/wikipedia/ru/1/1f/The_Wolf_of_Wall_Street.jpg", link: "https://www.imdb.com/title/tt0993846/", svc: "imdb" },
    { title: "Дюна", img: "https://upload.wikimedia.org/wikipedia/ru/8/8e/Dune_2021.jpg", link: "https://www.imdb.com/title/tt1160419/", svc: "imdb" },
    { title: "Мстители: Финал", img: "https://upload.wikimedia.org/wikipedia/ru/4/4d/Avengers_Endgame.jpg", link: "https://www.imdb.com/title/tt4154796/", svc: "imdb" },
    { title: "Терминатор 2: Судный день", img: "https://upload.wikimedia.org/wikipedia/ru/6/6a/Terminator2.jpg", link: "https://www.imdb.com/title/tt0103064/", svc: "imdb" },
    { title: "Чужой", img: "https://upload.wikimedia.org/wikipedia/ru/5/5b/Alien_1979.jpg", link: "https://www.imdb.com/title/tt0078748/", svc: "imdb" },
    { title: "Хищник", img: "https://upload.wikimedia.org/wikipedia/ru/a/a1/Predator_1987.jpg", link: "https://www.imdb.com/title/tt0093773/", svc: "imdb" },
    { title: "Бегущий по лезвию", img: "https://upload.wikimedia.org/wikipedia/ru/5/5b/Blade_Runner_1982.jpg", link: "https://www.imdb.com/title/tt0083658/", svc: "imdb" },
    { title: "Бегущий по лезвию 2049", img: "https://upload.wikimedia.org/wikipedia/ru/9/9f/Blade_Runner_2049.jpg", link: "https://www.imdb.com/title/tt1856101/", svc: "imdb" },
    { title: "Парк Юрского периода", img: "https://upload.wikimedia.org/wikipedia/ru/e/e7/Jurassic_Park.jpg", link: "https://www.imdb.com/title/tt0107290/", svc: "imdb" },
    { title: "Титаник", img: "https://upload.wikimedia.org/wikipedia/ru/2/22/Titanic_poster.jpg", link: "https://www.imdb.com/title/tt0120338/", svc: "imdb" },
    { title: "Аватар", img: "https://upload.wikimedia.org/wikipedia/ru/1/1f/Avatar_2009.jpg", link: "https://www.imdb.com/title/tt0499549/", svc: "imdb" },
    { title: "Оппенгеймер", img: "https://upload.wikimedia.org/wikipedia/ru/4/4a/Oppenheimer_%28film%29.jpg", link: "https://www.imdb.com/title/tt15398776/", svc: "imdb" },
    { title: "Барби", img: "https://upload.wikimedia.org/wikipedia/ru/7/7c/Barbie_2023.jpg", link: "https://www.imdb.com/title/tt1517268/", svc: "imdb" },
    { title: "Драйв", img: "https://upload.wikimedia.org/wikipedia/ru/3/3a/Drive_2011.jpg", link: "https://www.imdb.com/title/tt0780504/", svc: "imdb" },
    { title: "Джон Уик", img: "https://upload.wikimedia.org/wikipedia/ru/8/84/John_Wick_2014.jpg", link: "https://www.imdb.com/title/tt2911666/", svc: "imdb" },
    { title: "Джон Уик 2", img: "https://upload.wikimedia.org/wikipedia/ru/3/3f/John_Wick_Chapter_2.jpg", link: "https://www.imdb.com/title/tt4425200/", svc: "imdb" },
    { title: "Джон Уик 3", img: "https://upload.wikimedia.org/wikipedia/ru/3/36/John_Wick_Chapter_3.jpg", link: "https://www.imdb.com/title/tt6146586/", svc: "imdb" },
    { title: "Джон Уик 4", img: "https://upload.wikimedia.org/wikipedia/ru/a/a5/John_Wick_Chapter_4.jpg", link: "https://www.imdb.com/title/tt10366206/", svc: "imdb" },
    { title: "Миссия невыполнима", img: "https://upload.wikimedia.org/wikipedia/ru/8/8e/Mission_Impossible_1996.jpg", link: "https://www.imdb.com/title/tt0117060/", svc: "imdb" },
    { title: "Форсаж", img: "https://upload.wikimedia.org/wikipedia/ru/7/7c/The_Fast_and_the_Furious_2001.jpg", link: "https://www.imdb.com/title/tt0232500/", svc: "imdb" },
    { title: "Социальная сеть", img: "https://upload.wikimedia.org/wikipedia/ru/7/7b/The_Social_Network.jpg", link: "https://www.imdb.com/title/tt1285016/", svc: "imdb" },
    { title: "Игры разума", img: "https://upload.wikimedia.org/wikipedia/ru/1/17/A_Beautiful_Mind.jpg", link: "https://www.imdb.com/title/tt0268978/", svc: "imdb" },
    { title: "Умница Уилл Хантинг", img: "https://upload.wikimedia.org/wikipedia/ru/4/4c/Good_Will_Hunting.jpg", link: "https://www.imdb.com/title/tt0119217/", svc: "imdb" },
    { title: "Ла-Ла Ленд", img: "https://upload.wikimedia.org/wikipedia/ru/f/f4/La_La_Land.jpg", link: "https://www.imdb.com/title/tt3783958/", svc: "imdb" },
    { title: "Омерзительная восьмёрка", img: "https://upload.wikimedia.org/wikipedia/ru/2/2b/The_Hateful_Eight.jpg", link: "https://www.imdb.com/title/tt3460252/", svc: "imdb" },
    { title: "Бесславные ублюдки", img: "https://upload.wikimedia.org/wikipedia/ru/2/2c/Inglourious_Basterds.jpg", link: "https://www.imdb.com/title/tt0361748/", svc: "imdb" },
    { title: "Убить Билла", img: "https://upload.wikimedia.org/wikipedia/ru/b/b2/Kill_Bill_Volume_1.jpg", link: "https://www.imdb.com/title/tt0266697/", svc: "imdb" },
    { title: "Однажды в Голливуде", img: "https://upload.wikimedia.org/wikipedia/ru/2/29/Once_Upon_a_Time_in_Hollywood.jpg", link: "https://www.imdb.com/title/tt7131622/", svc: "imdb" }
  ],{ title: "Большой Лебовски", img: "https://upload.wikimedia.org/wikipedia/ru/7/7c/Big_Lebowski.jpg", link: "https://www.imdb.com/title/tt0118715/", svc: "imdb" },
    { title: "Фарго", img: "https://upload.wikimedia.org/wikipedia/ru/5/5e/Fargo_1996.jpg", link: "https://www.imdb.com/title/tt0116282/", svc: "imdb" },
    { title: "Старикам тут не место", img: "https://upload.wikimedia.org/wikipedia/ru/4/45/No_Country_for_Old_Men.jpg", link: "https://www.imdb.com/title/tt0477348/", svc: "imdb" },
    { title: "Марсианин", img: "https://upload.wikimedia.org/wikipedia/ru/3/34/The_Martian_2015.jpg", link: "https://www.imdb.com/title/tt3659388/", svc: "imdb" },
    { title: "Гравитация", img: "https://upload.wikimedia.org/wikipedia/ru/3/3a/Gravity_2013.jpg", link: "https://www.imdb.com/title/tt1454468/", svc: "imdb" },
    { title: "Прибытие", img: "https://upload.wikimedia.org/wikipedia/ru/8/82/Arrival_2016.jpg", link: "https://www.imdb.com/title/tt2543164/", svc: "imdb" },
    { title: "Тихоокеанский рубеж", img: "https://upload.wikimedia.org/wikipedia/ru/8/8f/Pacific_Rim_2013.jpg", link: "https://www.imdb.com/title/tt1663662/", svc: "imdb" },
    { title: "Годзилла", img: "https://upload.wikimedia.org/wikipedia/ru/8/8a/Godzilla_2014.jpg", link: "https://www.imdb.com/title/tt0831387/", svc: "imdb" },
    { title: "Бешеные псы", img: "https://upload.wikimedia.org/wikipedia/ru/9/94/Reservoir_Dogs.jpg", link: "https://www.imdb.com/title/tt0105236/", svc: "imdb" },
    { title: "Славные парни", img: "https://upload.wikimedia.org/wikipedia/ru/3/3e/Goodfellas.jpg", link: "https://www.imdb.com/title/tt0099685/", svc: "imdb" },
    { title: "Казино", img: "https://upload.wikimedia.org/wikipedia/ru/a/a7/Casino_1995.jpg", link: "https://www.imdb.com/title/tt0112641/", svc: "imdb" },
    { title: "Лицо со шрамом", img: "https://upload.wikimedia.org/wikipedia/ru/5/50/Scarface_1983.jpg", link: "https://www.imdb.com/title/tt0086250/", svc: "imdb" },
    { title: "Таксист", img: "https://upload.wikimedia.org/wikipedia/ru/9/9e/Taxi_Driver_1976.jpg", link: "https://www.imdb.com/title/tt0075314/", svc: "imdb" },
    { title: "Апокалипсис сегодня", img: "https://upload.wikimedia.org/wikipedia/ru/3/3c/Apocalypse_Now.jpg", link: "https://www.imdb.com/title/tt0078788/", svc: "imdb" },
    { title: "Цельнометаллическая оболочка", img: "https://upload.wikimedia.org/wikipedia/ru/1/15/Full_Metal_Jacket.jpg", link: "https://www.imdb.com/title/tt0093058/", svc: "imdb" },
    { title: "Заводной апельсин", img: "https://upload.wikimedia.org/wikipedia/ru/2/2e/A_Clockwork_Orange.jpg", link: "https://www.imdb.com/title/tt0066921/", svc: "imdb" },
    { title: "Сияние", img: "https://upload.wikimedia.org/wikipedia/ru/5/54/The_Shining_1980.jpg", link: "https://www.imdb.com/title/tt0081505/", svc: "imdb" },
    { title: "2001: Космическая одиссея", img: "https://upload.wikimedia.org/wikipedia/ru/0/05/2001_A_Space_Odyssey.jpg", link: "https://www.imdb.com/title/tt0062622/", svc: "imdb" },
    { title: "Помни", img: "https://upload.wikimedia.org/wikipedia/ru/8/8c/Memento_2000.jpg", link: "https://www.imdb.com/title/tt0209144/", svc: "imdb" },
    { title: "Довод", img: "https://upload.wikimedia.org/wikipedia/ru/4/47/Tenet_2020.jpg", link: "https://www.imdb.com/title/tt6723592/", svc: "imdb" },
    { title: "Тёмный рыцарь: Возрождение легенды", img: "https://upload.wikimedia.org/wikipedia/ru/4/48/Dark_Knight_Rises.jpg", link: "https://www.imdb.com/title/tt1345836/", svc: "imdb" },
    { title: "Бэтмен: Начало", img: "https://upload.wikimedia.org/wikipedia/ru/6/6a/Batman_Begins.jpg", link: "https://www.imdb.com/title/tt0372784/", svc: "imdb" },
    { title: "Железный человек", img: "https://upload.wikimedia.org/wikipedia/ru/7/70/Iron_Man_2008.jpg", link: "https://www.imdb.com/title/tt0371746/", svc: "imdb" },
    { title: "Первый мститель", img: "https://upload.wikimedia.org/wikipedia/ru/c/c9/Captain_America_The_First_Avenger.jpg", link: "https://www.imdb.com/title/tt0458339/", svc: "imdb" },
    { title: "Тор: Рагнарёк", img: "https://upload.wikimedia.org/wikipedia/ru/4/49/Thor_Ragnarok.jpg", link: "https://www.imdb.com/title/tt3501632/", svc: "imdb" },
    { title: "Стражи Галактики", img: "https://upload.wikimedia.org/wikipedia/ru/6/60/Guardians_of_the_Galaxy_2014.jpg", link: "https://www.imdb.com/title/tt2015381/", svc: "imdb" },
    { title: "Дэдпул", img: "https://upload.wikimedia.org/wikipedia/ru/4/4d/Deadpool_2016.jpg", link: "https://www.imdb.com/title/tt1431045/", svc: "imdb" },
    { title: "Логан", img: "https://upload.wikimedia.org/wikipedia/ru/3/3e/Logan_2017.jpg", link: "https://www.imdb.com/title/tt3315342/", svc: "imdb" },
    { title: "Человек-паук: Через вселенные", img: "https://upload.wikimedia.org/wikipedia/ru/7/73/Spider-Man_Into_the_Spider-Verse.jpg", link: "https://www.imdb.com/title/tt4633694/", svc: "imdb" },
    { title: "Матрица: Перезагрузка", img: "https://upload.wikimedia.org/wikipedia/ru/b/bd/The_Matrix_Reloaded.jpg", link: "https://www.imdb.com/title/tt0234215/", svc: "imdb" },
    { title: "Звёздные войны: Новая надежда", img: "https://upload.wikimedia.org/wikipedia/ru/6/6c/Star_Wars_Episode_IV_A_New_Hope.jpg", link: "https://www.imdb.com/title/tt0076759/", svc: "imdb" },
    { title: "Звёздные войны: Возвращение джедая", img: "https://upload.wikimedia.org/wikipedia/ru/4/4c/Return_of_the_Jedi.jpg", link: "https://www.imdb.com/title/tt0086190/", svc: "imdb" },
    { title: "Изгой-один", img: "https://upload.wikimedia.org/wikipedia/ru/c/c3/Rogue_One_2016.jpg", link: "https://www.imdb.com/title/tt3748528/", svc: "imdb" },
    { title: "Гарри Поттер и философский камень", img: "https://upload.wikimedia.org/wikipedia/ru/d/d4/Harry_Potter_and_the_Philosopher%27s_Stone.jpg", link: "https://www.imdb.com/title/tt0241527/", svc: "imdb" },
    { title: "Гарри Поттер и Кубок огня", img: "https://upload.wikimedia.org/wikipedia/ru/b/b3/Harry_Potter_and_the_Goblet_of_Fire.jpg", link: "https://www.imdb.com/title/tt0330373/", svc: "imdb" },
    { title: "Гарри Поттер и Дары Смерти: Часть 2", img: "https://upload.wikimedia.org/wikipedia/ru/9/96/Harry_Potter_and_the_Deathly_Hallows_%E2%80%93_Part_2.jpg", link: "https://www.imdb.com/title/tt1201607/", svc: "imdb" },
    { title: "Пираты Карибского моря", img: "https://upload.wikimedia.org/wikipedia/ru/2/2e/Pirates_of_the_Caribbean_The_Curse_of_the_Black_Pearl.jpg", link: "https://www.imdb.com/title/tt0325980/", svc: "imdb" },
    { title: "Шрэк", img: "https://upload.wikimedia.org/wikipedia/ru/3/39/Shrek.jpg", link: "https://www.imdb.com/title/tt0126029/", svc: "imdb" },
    { title: "Король Лев", img: "https://upload.wikimedia.org/wikipedia/ru/3/3d/The_Lion_King_1994.jpg", link: "https://www.imdb.com/title/tt0110357/", svc: "imdb" },
    { title: "ВАЛЛ-И", img: "https://upload.wikimedia.org/wikipedia/ru/c/c2/WALL-E.jpg", link: "https://www.imdb.com/title/tt0910970/", svc: "imdb" },
    { title: "Вверх", img: "https://upload.wikimedia.org/wikipedia/ru/8/8c/Up_2009.jpg", link: "https://www.imdb.com/title/tt1049413/", svc: "imdb" },
    { title: "Головоломка", img: "https://upload.wikimedia.org/wikipedia/ru/4/4f/Inside_Out_2015.jpg", link: "https://www.imdb.com/title/tt2096673/", svc: "imdb" },
    { title: "Тайна Коко", img: "https://upload.wikimedia.org/wikipedia/ru/6/62/Coco_2017.jpg", link: "https://www.imdb.com/title/tt2380307/", svc: "imdb" },
    { title: "Ходячий замок", img: "https://upload.wikimedia.org/wikipedia/ru/e/e0/Howl%27s_Moving_Castle.jpg", link: "https://www.imdb.com/title/tt0347149/", svc: "imdb" },
    { title: "Принцесса Мононоке", img: "https://upload.wikimedia.org/wikipedia/ru/6/61/Princess_Mononoke.jpg", link: "https://www.imdb.com/title/tt0119698/", svc: "imdb" },
    { title: "Мой сосед Тоторо", img: "https://upload.wikimedia.org/wikipedia/ru/0/02/My_Neighbor_Totoro.jpg", link: "https://www.imdb.com/title/tt0096283/", svc: "imdb" },
    { title: "Твоё имя", img: "https://upload.wikimedia.org/wikipedia/ru/2/2a/Your_Name_2016.jpg", link: "https://www.imdb.com/title/tt5311514/", svc: "imdb" },
    { title: "Форма голоса", img: "https://upload.wikimedia.org/wikipedia/ru/f/f5/A_Silent_Voice_2016.jpg", link: "https://www.imdb.com/title/tt5323662/", svc: "imdb" },
    { title: "Пять сантиметров в секунду", img: "https://upload.wikimedia.org/wikipedia/ru/0/0a/5_Centimeters_per_Second.jpg", link: "https://www.imdb.com/title/tt0983213/", svc: "imdb" },
    { title: "Сад изящных слов", img: "https://upload.wikimedia.org/wikipedia/ru/8/80/The_Garden_of_Words.jpg", link: "https://www.imdb.com/title/tt2591814/", svc: "imdb" },
    { title: "Дитя погоды", img: "https://upload.wikimedia.org/wikipedia/ru/1/10/Weathering_with_You.jpg", link: "https://www.imdb.com/title/tt9426210/", svc: "imdb" },
    { title: "Исчезнувшая", img: "https://upload.wikimedia.org/wikipedia/ru/6/6d/Gone_Girl_2014.jpg", link: "https://www.imdb.com/title/tt2267998/", svc: "imdb" },
    { title: "Пленницы", img: "https://upload.wikimedia.org/wikipedia/ru/1/19/Prisoners_2013.jpg", link: "https://www.imdb.com/title/tt1392214/", svc: "imdb" },
    { title: "Настоящий детектив", img: "https://upload.wikimedia.org/wikipedia/ru/2/2c/True_Detective_season_1.jpg", link: "https://www.imdb.com/title/tt2356777/", svc: "imdb" },
    { title: "Во все тяжкие", img: "https://upload.wikimedia.org/wikipedia/ru/3/3d/Breaking_Bad.jpg", link: "https://www.imdb.com/title/tt0903747/", svc: "imdb" },
    { title: "Лучше звоните Солу", img: "https://upload.wikimedia.org/wikipedia/ru/2/28/Better_Call_Saul.jpg", link: "https://www.imdb.com/title/tt3032476/", svc: "imdb" },
    { title: "Чернобыль", img: "https://upload.wikimedia.org/wikipedia/ru/3/33/Chernobyl_2019.jpg", link: "https://www.imdb.com/title/tt7366338/", svc: "imdb" },
    { title: "Шерлок", img: "https://upload.wikimedia.org/wikipedia/ru/4/4b/Sherlock_2010.jpg", link: "https://www.imdb.com/title/tt1475582/", svc: "imdb" },
    { title: "Очень странные дела", img: "https://upload.wikimedia.org/wikipedia/ru/2/23/Stranger_Things.jpg", link: "https://www.imdb.com/title/tt4574334/", svc: "imdb" },
    { title: "Игра престолов", img: "https://upload.wikimedia.org/wikipedia/ru/1/1f/Game_of_Thrones_2011.jpg", link: "https://www.imdb.com/title/tt0944947/", svc: "imdb" },
    { title: "Мир Дикого Запада", img: "https://upload.wikimedia.org/wikipedia/ru/d/d8/Westworld_2016.jpg", link: "https://www.imdb.com/title/tt0475784/", svc: "imdb" },
    { title: "Острые козырьки", img: "https://upload.wikimedia.org/wikipedia/ru/7/72/Peaky_Blinders.jpg", link: "https://www.imdb.com/title/tt2442560/", svc: "imdb" },
    { title: "Корона", img: "https://upload.wikimedia.org/wikipedia/ru/6/6a/The_Crown_2016.jpg", link: "https://www.imdb.com/title/tt4786824/", svc: "imdb" },
    { title: "Рик и Морти", img: "https://upload.wikimedia.org/wikipedia/ru/1/12/Rick_and_Morty.jpg", link: "https://www.imdb.com/title/tt2861424/", svc: "imdb" },
    { title: "Гравити Фолз", img: "https://upload.wikimedia.org/wikipedia/ru/3/35/Gravity_Falls.jpg", link: "https://www.imdb.com/title/tt1865718/", svc: "imdb" }
  ],  games: [
    { title: "The Witcher 3: Wild Hunt", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/capsule_184x69.jpg", link: "https://store.steampowered.com/app/292030/", svc: "steam" },
    { title: "Cyberpunk 2077", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1091500/", svc: "steam" },
    { title: "Elden Ring", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1245620/", svc: "steam" },
    { title: "Grand Theft Auto V", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/capsule_184x69.jpg", link: "https://store.steampowered.com/app/271590/", svc: "steam" },
    { title: "Red Dead Redemption 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1174180/", svc: "steam" },
    { title: "Counter-Strike 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/capsule_184x69.jpg", link: "https://store.steampowered.com/app/730/", svc: "steam" },
    { title: "Dota 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/570/capsule_184x69.jpg", link: "https://store.steampowered.com/app/570/", svc: "steam" },
    { title: "Baldur's Gate 3", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1086940/", svc: "steam" },
    { title: "The Elder Scrolls V: Skyrim", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/489830/capsule_184x69.jpg", link: "https://store.steampowered.com/app/489830/", svc: "steam" },
    { title: "Hollow Knight", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/capsule_184x69.jpg", link: "https://store.steampowered.com/app/367520/", svc: "steam" },
    { title: "Hades", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1145360/", svc: "steam" },
    { title: "Terraria", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/capsule_184x69.jpg", link: "https://store.steampowered.com/app/105600/", svc: "steam" },
    { title: "Stardew Valley", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/413150/capsule_184x69.jpg", link: "https://store.steampowered.com/app/413150/", svc: "steam" },
    { title: "Portal 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/capsule_184x69.jpg", link: "https://store.steampowered.com/app/620/", svc: "steam" },
    { title: "Half-Life 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/220/capsule_184x69.jpg", link: "https://store.steampowered.com/app/220/", svc: "steam" },
    { title: "DOOM Eternal", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/capsule_184x69.jpg", link: "https://store.steampowered.com/app/782330/", svc: "steam" },
    { title: "Fallout: New Vegas", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/22380/capsule_184x69.jpg", link: "https://store.steampowered.com/app/22380/", svc: "steam" },
    { title: "Dark Souls III", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/374320/capsule_184x69.jpg", link: "https://store.steampowered.com/app/374320/", svc: "steam" },
    { title: "Sekiro: Shadows Die Twice", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/capsule_184x69.jpg", link: "https://store.steampowered.com/app/814380/", svc: "steam" },
    { title: "Resident Evil 4", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/115160/capsule_184x69.jpg", link: "https://store.steampowered.com/app/115160/", svc: "steam" },
    { title: "Mass Effect 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/24980/capsule_184x69.jpg", link: "https://store.steampowered.com/app/24980/", svc: "steam" },
    { title: "Rust", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/capsule_184x69.jpg", link: "https://store.steampowered.com/app/252490/", svc: "steam" },
    { title: "Subnautica", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/264710/capsule_184x69.jpg", link: "https://store.steampowered.com/app/264710/", svc: "steam" },
    { title: "Phasmophobia", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/739630/capsule_184x69.jpg", link: "https://store.steampowered.com/app/739630/", svc: "steam" },
    { title: "Valheim", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/892970/capsule_184x69.jpg", link: "https://store.steampowered.com/app/892970/", svc: "steam" },
    { title: "RimWorld", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/294100/capsule_184x69.jpg", link: "https://store.steampowered.com/app/294100/", svc: "steam" },
    { title: "Factorio", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/427520/capsule_184x69.jpg", link: "https://store.steampowered.com/app/427520/", svc: "steam" },
    { title: "Dead Cells", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/588650/capsule_184x69.jpg", link: "https://store.steampowered.com/app/588650/", svc: "steam" },
    { title: "Celeste", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/capsule_184x69.jpg", link: "https://store.steampowered.com/app/504230/", svc: "steam" },
    { title: "Undertale", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/391540/capsule_184x69.jpg", link: "https://store.steampowered.com/app/391540/", svc: "steam" },
    { title: "Cuphead", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/268910/capsule_184x69.jpg", link: "https://store.steampowered.com/app/268910/", svc: "steam" },
    { title: "Left 4 Dead 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/550/capsule_184x69.jpg", link: "https://store.steampowered.com/app/550/", svc: "steam" },
    { title: "Team Fortress 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/440/capsule_184x69.jpg", link: "https://store.steampowered.com/app/440/", svc: "steam" },
    { title: "Civilization VI", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/289070/capsule_184x69.jpg", link: "https://store.steampowered.com/app/289070/", svc: "steam" },
    { title: "Age of Empires IV", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1466860/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1466860/", svc: "steam" },
    { title: "Cities: Skylines", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/255710/capsule_184x69.jpg", link: "https://store.steampowered.com/app/255710/", svc: "steam" },
    { title: "Euro Truck Simulator 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/227300/capsule_184x69.jpg", link: "https://store.steampowered.com/app/227300/", svc: "steam" },
    { title: "The Sims 4", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222670/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1222670/", svc: "steam" },
    { title: "Among Us", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/945360/capsule_184x69.jpg", link: "https://store.steampowered.com/app/945360/", svc: "steam" },
    { title: "Fall Guys", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1097150/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1097150/", svc: "steam" },
    { title: "It Takes Two", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1426210/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1426210/", svc: "steam" },
    { title: "A Way Out", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222700/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1222700/", svc: "steam" },
    { title: "God of War", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1593500/", svc: "steam" },
    { title: "Horizon Zero Dawn", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1151640/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1151640/", svc: "steam" },
    { title: "Death Stranding", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1850570/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1850570/", svc: "steam" },
    { title: "Ghost of Tsushima", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/capsule_184x69.jpg", link: "https://store.steampowered.com/app/2215430/", svc: "steam" },
    { title: "The Last of Us Part I", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1888930/", svc: "steam" },
    { title: "Spider-Man Remastered", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1817070/", svc: "steam" },
    { title: "Uncharted 4", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1659420/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1659420/", svc: "steam" },
    { title: "Final Fantasy VII Remake", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1462040/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1462040/", svc: "steam" },
    { title: "Persona 5 Royal", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1687950/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1687950/", svc: "steam" },
    { title: "Yakuza 0", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/638970/capsule_184x69.jpg", link: "https://store.steampowered.com/app/638970/", svc: "steam" },
    { title: "Monster Hunter World", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/582010/capsule_184x69.jpg", link: "https://store.steampowered.com/app/582010/", svc: "steam" },
    { title: "Rainbow Six Siege", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/359550/capsule_184x69.jpg", link: "https://store.steampowered.com/app/359550/", svc: "steam" },
    { title: "Apex Legends", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172470/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1172470/", svc: "steam" },
    { title: "Call of Duty: MW II", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1938090/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1938090/", svc: "steam" },
    { title: "Battlefield 2042", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1517290/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1517290/", svc: "steam" },
    { title: "Destiny 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1085660/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1085660/", svc: "steam" },
    { title: "Warframe", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/230410/capsule_184x69.jpg", link: "https://store.steampowered.com/app/230410/", svc: "steam" },
    { title: "Path of Exile", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/238960/capsule_184x69.jpg", link: "https://store.steampowered.com/app/238960/", svc: "steam" },
    { title: "Divinity: Original Sin 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/435150/capsule_184x69.jpg", link: "https://store.steampowered.com/app/435150/", svc: "steam" },
    { title: "Disco Elysium", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/632470/capsule_184x69.jpg", link: "https://store.steampowered.com/app/632470/", svc: "steam" },
    { title: "Outer Wilds", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/753640/capsule_184x69.jpg", link: "https://store.steampowered.com/app/753640/", svc: "steam" },
    { title: "Slay the Spire", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/646570/capsule_184x69.jpg", link: "https://store.steampowered.com/app/646570/", svc: "steam" },
    { title: "Inscryption", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1092790/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1092790/", svc: "steam" },
    { title: "Return of the Obra Dinn", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/653530/capsule_184x69.jpg", link: "https://store.steampowered.com/app/653530/", svc: "steam" },
    { title: "The Stanley Parable", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1703340/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1703340/", svc: "steam" },
    { title: "Firewatch", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/383870/capsule_184x69.jpg", link: "https://store.steampowered.com/app/383870/", svc: "steam" },
    { title: "What Remains of Edith Finch", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/501300/capsule_184x69.jpg", link: "https://store.steampowered.com/app/501300/", svc: "steam" },
    { title: "Life is Strange", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/319630/capsule_184x69.jpg", link: "https://store.steampowered.com/app/319630/", svc: "steam" },
    { title: "Detroit: Become Human", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222140/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1222140/", svc: "steam" },
    { title: "Heavy Rain", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/960910/capsule_184x69.jpg", link: "https://store.steampowered.com/app/960910/", svc: "steam" },
    { title: "Assassin's Creed Valhalla", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2208920/capsule_184x69.jpg", link: "https://store.steampowered.com/app/2208920/", svc: "steam" },
    { title: "Far Cry 6", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2369390/capsule_184x69.jpg", link: "https://store.steampowered.com/app/2369390/", svc: "steam" },
    { title: "Watch Dogs 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/447040/capsule_184x69.jpg", link: "https://store.steampowered.com/app/447040/", svc: "steam" },
    { title: "Forza Horizon 5", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1551360/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1551360/", svc: "steam" },
    { title: "Need for Speed Heat", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222680/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1222680/", svc: "steam" },
    { title: "FIFA 23", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1811260/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1811260/", svc: "steam" },
    { title: "NBA 2K24", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2338770/capsule_184x69.jpg", link: "https://store.steampowered.com/app/2338770/", svc: "steam" },
    { title: "Rocket League", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252950/capsule_184x69.jpg", link: "https://store.steampowered.com/app/252950/", svc: "steam" },
    { title: "Mortal Kombat 11", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/976310/capsule_184x69.jpg", link: "https://store.steampowered.com/app/976310/", svc: "steam" },
    { title: "Tekken 8", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1778820/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1778820/", svc: "steam" },
    { title: "Street Fighter 6", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1364780/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1364780/", svc: "steam" },
    { title: "Minecraft", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/204100/capsule_184x69.jpg", link: "https://www.minecraft.net/", svc: "steam" },
    { title: "Roblox", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/290130/capsule_184x69.jpg", link: "https://www.roblox.com/", svc: "steam" },
    { title: "Genshin Impact", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1904730/capsule_184x69.jpg", link: "https://genshin.hoyoverse.com/", svc: "steam" },
    { title: "Honkai: Star Rail", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2349140/capsule_184x69.jpg", link: "https://hsr.hoyoverse.com/", svc: "steam" },
    { title: "Valorant", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2163320/capsule_184x69.jpg", link: "https://playvalorant.com/", svc: "steam" },
    { title: "League of Legends", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/20590/capsule_184x69.jpg", link: "https://www.leagueoflegends.com/", svc: "steam" },
    { title: "World of Warcraft", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1250/capsule_184x69.jpg", link: "https://worldofwarcraft.blizzard.com/", svc: "steam" },
    { title: "Overwatch 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2357570/capsule_184x69.jpg", link: "https://overwatch.blizzard.com/", svc: "steam" },
    { title: "Palworld", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1623730/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1623730/", svc: "steam" },
    { title: "Brotato", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1942280/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1942280/", svc: "steam" },
    { title: "Vampire Survivors", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1794680/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1794680/", svc: "steam" },
    { title: "Dave the Diver", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1868140/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1868140/", svc: "steam" },
    { title: "Lethal Company", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1966720/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1966720/", svc: "steam" }
  ],  actors: [
    { title: "Ди Каприо", img: "https://upload.wikimedia.org/wikipedia/commons/2/25/Leonardo_DiCaprio_2014.jpg", link: "https://www.imdb.com/name/nm0000138/", svc: "imdb" },
    { title: "Киану Ривз", img: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Keanu_Reeves_%28crop_and_levels%29_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0000206/", svc: "imdb" },
    { title: "Скарлетт Йоханссон", img: "https://upload.wikimedia.org/wikipedia/commons/6/60/Scarlett_Johansson_by_Gage_Skidmore_2_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0424060/", svc: "imdb" },
    { title: "Том Харди", img: "https://upload.wikimedia.org/wikipedia/commons/4/43/Tom_Hardy_by_Gage_Skidmore.jpg", link: "https://www.imdb.com/name/nm0362766/", svc: "imdb" },
    { title: "Марго Робби", img: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Margot_Robbie_by_Gage_Skidmore_2018.jpg", link: "https://www.imdb.com/name/nm3053338/", svc: "imdb" },
    { title: "Роберт Дауни мл.", img: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Robert_Downey_Jr_2014_Comic_Con_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0000375/", svc: "imdb" },
    { title: "Кристиан Бэйл", img: "https://upload.wikimedia.org/wikipedia/commons/7/73/Christian_Bale-2014.jpg", link: "https://www.imdb.com/name/nm0000288/", svc: "imdb" },
    { title: "Натали Портман", img: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Natalie_Portman_%2848470988352%29_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0000204/", svc: "imdb" },
    { title: "Брэд Питт", img: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Brad_Pitt_2019_by_Glenn_Francis.jpg", link: "https://www.imdb.com/name/nm0000093/", svc: "imdb" },
    { title: "Джонни Депп", img: "https://upload.wikimedia.org/wikipedia/commons/2/21/Johnny_Depp_2020.jpg", link: "https://www.imdb.com/name/nm0000136/", svc: "imdb" },
    { title: "Том Круз", img: "https://upload.wikimedia.org/wikipedia/commons/3/33/Tom_Cruise_by_Gage_Skidmore_2.jpg", link: "https://www.imdb.com/name/nm0000129/", svc: "imdb" },
    { title: "Мэттью Макконахи", img: "https://upload.wikimedia.org/wikipedia/commons/1/18/Matthew_McConaughey_-_Goldene_Kamera_2014_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0000190/", svc: "imdb" },
    { title: "Энн Хэтэуэй", img: "https://upload.wikimedia.org/wikipedia/commons/2/22/Anne_Hathaway_at_the_2007_Deauville_American_Film_Festival-01A.jpg", link: "https://www.imdb.com/name/nm0004266/", svc: "imdb" },
    { title: "Киллиан Мерфи", img: "https://upload.wikimedia.org/wikipedia/commons/3/33/Cillian_Murphy-2014.jpg", link: "https://www.imdb.com/name/nm0147068/", svc: "imdb" },
    { title: "Гэри Олдман", img: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Gary_Oldman_%282017%29.jpg", link: "https://www.imdb.com/name/nm0000198/", svc: "imdb" },
    { title: "Райан Гослинг", img: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Ryan_Gosling_in_2018.jpg", link: "https://www.imdb.com/name/nm0331516/", svc: "imdb" },
    { title: "Хит Леджер", img: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Heath_Ledger_%282006%29.jpg", link: "https://www.imdb.com/name/nm0005132/", svc: "imdb" },
    { title: "Анджелина Джоли", img: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Angelina_Jolie_2_June_2014_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0001401/", svc: "imdb" },
    { title: "Аль Пачино", img: "https://upload.wikimedia.org/wikipedia/commons/9/98/Al_Pacino_-_2016.jpg", link: "https://www.imdb.com/name/nm0000199/", svc: "imdb" },
    { title: "Уилл Смит", img: "https://upload.wikimedia.org/wikipedia/commons/3/3f/TechCrunch_Disrupt_2019_%2848834434641%29_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0000226/", svc: "imdb" },
    { title: "Эмма Стоун", img: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Emma_Stone_at_Maniac_UK_premiere_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm1297015/", svc: "imdb" },
    { title: "Том Хэнкс", img: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Tom_Hanks_TIFF_2019.jpg", link: "https://www.imdb.com/name/nm0000158/", svc: "imdb" },
    { title: "Джейк Джилленхол", img: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Jake_Gyllenhaal_2019.jpg", link: "https://www.imdb.com/name/nm0350453/", svc: "imdb" },
    { title: "Крис Хемсворт", img: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Chris_Hemsworth_by_Gage_Skidmore_2.jpg", link: "https://www.imdb.com/name/nm1165110/", svc: "imdb" },
    { title: "Марк Уолберг", img: "https://upload.wikimedia.org/wikipedia/commons/2/27/Mark_Wahlberg_2017.jpg", link: "https://www.imdb.com/name/nm0000242/", svc: "imdb" },
    { title: "Дэниэл Дэй-Льюис", img: "https://upload.wikimedia.org/wikipedia/commons/6/68/Daniel_Day-Lewis_2013.jpg", link: "https://www.imdb.com/name/nm0000358/", svc: "imdb" },
    { title: "Роберт Де Ниро", img: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Robert_De_Niro_Cannes_2016.jpg", link: "https://www.imdb.com/name/nm0000134/", svc: "imdb" },
    { title: "Энтони Хопкинс", img: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Anthony_Hopkins_2010.jpg", link: "https://www.imdb.com/name/nm0000164/", svc: "imdb" },
    { title: "Морган Фриман", img: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Morgan_Freeman_2017.jpg", link: "https://www.imdb.com/name/nm0000151/", svc: "imdb" },
    { title: "Харрисон Форд", img: "https://upload.wikimedia.org/wikipedia/commons/3/34/Harrison_Ford_by_Gage_Skidmore_3.jpg", link: "https://www.imdb.com/name/nm0000148/", svc: "imdb" },
    { title: "Дензел Вашингтон", img: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Denzel_Washington_2018.jpg", link: "https://www.imdb.com/name/nm0000243/", svc: "imdb" },
    { title: "Сэмюэл Л. Джексон", img: "https://upload.wikimedia.org/wikipedia/commons/2/29/Samuel_L._Jackson_SDCC_2014_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0000168/", svc: "imdb" },
    { title: "Мэтт Дэймон", img: "https://upload.wikimedia.org/wikipedia/commons/8/83/Matt_Damon_Cannes_2016.jpg", link: "https://www.imdb.com/name/nm0000354/", svc: "imdb" },
    { title: "Хоакин Феникс", img: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Joaquin_Phoenix-2018.jpg", link: "https://www.imdb.com/name/nm0001618/", svc: "imdb" },
    { title: "Эдвард Нортон", img: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Edward_Norton_2012.jpg", link: "https://www.imdb.com/name/nm0001570/", svc: "imdb" },
    { title: "Николь Кидман", img: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Nicole_Kidman_Cannes_2017.jpg", link: "https://www.imdb.com/name/nm0000173/", svc: "imdb" },
    { title: "Шарлиз Терон", img: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Charlize_Theron-2016.jpg", link: "https://www.imdb.com/name/nm0000234/", svc: "imdb" },
    { title: "Джулия Робертс", img: "https://upload.wikimedia.org/wikipedia/commons/4/44/Julia_Roberts_2011_Shankbone_2.JPG", link: "https://www.imdb.com/name/nm0000210/", svc: "imdb" },
    { title: "Сандра Буллок", img: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Sandra_Bullock_2018.jpg", link: "https://www.imdb.com/name/nm0000113/", svc: "imdb" },
    { title: "Дженнифер Лоуренс", img: "https://upload.wikimedia.org/wikipedia/commons/5/54/Jennifer_Lawrence_in_2016.jpg", link: "https://www.imdb.com/name/nm2225369/", svc: "imdb" },
    { title: "Рассел Кроу", img: "https://upload.wikimedia.org/wikipedia/commons/1/18/Russell_Crowe_%282017%29.jpg", link: "https://www.imdb.com/name/nm0000128/", svc: "imdb" },
    { title: "Хью Джекман", img: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Hugh_Jackman_2017.jpg", link: "https://www.imdb.com/name/nm0413168/", svc: "imdb" },
    { title: "Крис Эванс", img: "https://upload.wikimedia.org/wikipedia/commons/3/33/Chris_Evans_2020.jpg", link: "https://www.imdb.com/name/nm0262635/", svc: "imdb" },
    { title: "Крис Прэтт", img: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Chris_Pratt_2018.jpg", link: "https://www.imdb.com/name/nm0695435/", svc: "imdb" },
    { title: "Дуэйн Джонсон", img: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Dwayne_Johnson_2014_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0425005/", svc: "imdb" },
    { title: "Джейсон Стэтхем", img: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Jason_Statham_2018.jpg", link: "https://www.imdb.com/name/nm0005458/", svc: "imdb" },
    { title: "Вин Дизель", img: "https://upload.wikimedia.org/wikipedia/commons/5/52/Vin_Diesel_by_Gage_Skidmore_2.jpg", link: "https://www.imdb.com/name/nm0004874/", svc: "imdb" },
    { title: "Лиам Нисон", img: "https://upload.wikimedia.org/wikipedia/commons/1/12/Liam_Neeson_Deauville_2012.jpg", link: "https://www.imdb.com/name/nm0000553/", svc: "imdb" },
    { title: "Бенедикт Камбербэтч", img: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Benedict_Cumberbatch_2014_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm1212722/", svc: "imdb" },
    { title: "Тимоти Шаламе", img: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Timoth%C3%A9e_Chalamet_2017.jpg", link: "https://www.imdb.com/name/nm3154303/", svc: "imdb" },
    { title: "Оскар Айзек", img: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Oscar_Isaac_by_Gage_Skidmore.jpg", link: "https://www.imdb.com/name/nm1209966/", svc: "imdb" },
    { title: "Майкл Фассбендер", img: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Michael_Fassbender_by_Gage_Skidmore_2015.jpg", link: "https://www.imdb.com/name/nm1055413/", svc: "imdb" },
    { title: "Джеймс Макэвой", img: "https://upload.wikimedia.org/wikipedia/commons/3/3a/James_McAvoy_2015.jpg", link: "https://www.imdb.com/name/nm0564215/", svc: "imdb" },
    { title: "Идрис Эльба", img: "https://upload.wikimedia.org/wikipedia/commons/1/15/Idris_Elba-2014.jpg", link: "https://www.imdb.com/name/nm0252961/", svc: "imdb" },
    { title: "Джек Николсон", img: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Jack_Nicholson_2002_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0000197/", svc: "imdb" },
    { title: "Дастин Хоффман", img: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Dustin_Hoffman_Cannes_2013.jpg", link: "https://www.imdb.com/name/nm0000163/", svc: "imdb" },
    { title: "Роберт Паттинсон", img: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Robert_Pattinson_2020.jpg", link: "https://www.imdb.com/name/nm1500155/", svc: "imdb" },
    { title: "Кристен Стюарт", img: "https://upload.wikimedia.org/wikipedia/commons/4/42/Kristen_Stewart_Cannes_2018.jpg", link: "https://www.imdb.com/name/nm0829576/", svc: "imdb" },
    { title: "Эмилия Кларк", img: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Emilia_Clarke_2015.jpg", link: "https://www.imdb.com/name/nm3592338/", svc: "imdb" },
    { title: "Галь Гадот", img: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Gal_Gadot_by_Gage_Skidmore_3.jpg", link: "https://www.imdb.com/name/nm2933757/", svc: "imdb" },
    { title: "Райан Рейнольдс", img: "https://upload.wikimedia.org/wikipedia/commons/1/14/Ryan_Reynolds_by_Gage_Skidmore.jpg", link: "https://www.imdb.com/name/nm0005351/", svc: "imdb" },
    { title: "Уилл Феррелл", img: "https://upload.wikimedia.org/wikipedia/commons/3/33/Will_Ferrell_2012.jpg", link: "https://www.imdb.com/name/nm0002071/", svc: "imdb" },
    { title: "Джим Керри", img: "https://upload.wikimedia.org/wikipedia/commons/8/81/Jim_Carrey_2008.jpg", link: "https://www.imdb.com/name/nm0000120/", svc: "imdb" },
    { title: "Адам Сэндлер", img: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Adam_Sandler_2018.jpg", link: "https://www.imdb.com/name/nm0001191/", svc: "imdb" },
    { title: "Кевин Харт", img: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Kevin_Hart_2018.png", link: "https://www.imdb.com/name/nm0366389/", svc: "imdb" },
    { title: "Вуди Харрельсон", img: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Woody_Harrelson_October_2016.jpg", link: "https://www.imdb.com/name/nm0000437/", svc: "imdb" },
    { title: "Джереми Реннер", img: "https://upload.wikimedia.org/wikipedia/commons/8/82/Jeremy_Renner_2019.jpg", link: "https://www.imdb.com/name/nm0719637/", svc: "imdb" },
    { title: "Марк Руффало", img: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Mark_Ruffalo_2017.jpg", link: "https://www.imdb.com/name/nm0749263/", svc: "imdb" },
    { title: "Дон Чидл", img: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Don_Cheadle_Cannes_2018.jpg", link: "https://www.imdb.com/name/nm0000332/", svc: "imdb" },
    { title: "Пол Радд", img: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Paul_Rudd_2018.jpg", link: "https://www.imdb.com/name/nm0748620/", svc: "imdb" },
    { title: "Джош Бролин", img: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Josh_Brolin_SDCC_2016.jpg", link: "https://www.imdb.com/name/nm0000982/", svc: "imdb" },
    { title: "Том Холланд", img: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Tom_Holland_by_Gage_Skidmore.jpg", link: "https://www.imdb.com/name/nm4043618/", svc: "imdb" },
    { title: "Зендея", img: "https://upload.wikimedia.org/wikipedia/commons/2/28/Zendaya_-_2019_by_Glenn_Francis.jpg", link: "https://www.imdb.com/name/nm3918035/", svc: "imdb" },
    { title: "Флоренс Пью", img: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Florence_Pugh_2020.jpg", link: "https://www.imdb.com/name/nm6073955/", svc: "imdb" },
    { title: "Ана де Армас", img: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Ana_de_Armas_2020.jpg", link: "https://www.imdb.com/name/nm1869101/", svc: "imdb" },
    { title: "Джессика Честейн", img: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Jessica_Chastain_Cannes_2016.jpg", link: "https://www.imdb.com/name/nm1567113/", svc: "imdb" },
    { title: "Сирша Ронан", img: "https://upload.wikimedia.org/wikipedia/commons/3/39/Saoirse_Ronan-2016.jpg", link: "https://www.imdb.com/name/nm1519680/", svc: "imdb" },
    { title: "Бри Ларсон", img: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Brie_Larson_Cannes_2018.jpg", link: "https://www.imdb.com/name/nm0488953/", svc: "imdb" },
    { title: "Люпита Нионго", img: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Lupita_Nyong%27o_2019_by_Glenn_Francis.jpg", link: "https://www.imdb.com/name/nm2143282/", svc: "imdb" },
    { title: "Виола Дэвис", img: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Viola_Davis_by_Gage_Skidmore.jpg", link: "https://www.imdb.com/name/nm0205626/", svc: "imdb" },
    { title: "Кейт Бланшетт", img: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Cate_Blanchett_Cannes_2018.jpg", link: "https://www.imdb.com/name/nm0000949/", svc: "imdb" },
    { title: "Джеймс Франко", img: "https://upload.wikimedia.org/wikipedia/commons/2/26/James_Franco_March_2013.jpg", link: "https://www.imdb.com/name/nm0290556/", svc: "imdb" },
    { title: "Сет Роген", img: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Seth_Rogen_2019.jpg", link: "https://www.imdb.com/name/nm0736622/", svc: "imdb" },
    { title: "Джона Хилл", img: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Jonah_Hill-2019.jpg", link: "https://www.imdb.com/name/nm1706767/", svc: "imdb" },
    { title: "Брэдли Купер", img: "https://upload.wikimedia.org/wikipedia/commons/3/30/Bradley_Cooper_2018.jpg", link: "https://www.imdb.com/name/nm0177896/", svc: "imdb" },
    { title: "Леди Гага", img: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Lady_Gaga_at_Joe_Biden%27s_inauguration_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm3078932/", svc: "imdb" },
    { title: "Хавьер Бардем", img: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Javier_Bardem_Cannes_2018.jpg", link: "https://www.imdb.com/name/nm0000849/", svc: "imdb" },
    { title: "Пенелопа Крус", img: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Penelope_Cruz_Cannes_2018.jpg", link: "https://www.imdb.com/name/nm0004851/", svc: "imdb" },
    { title: "Антонио Бандерас", img: "https://upload.wikimedia.org/wikipedia/commons/5/54/Antonio_Banderas_2020.jpg", link: "https://www.imdb.com/name/nm0000104/", svc: "imdb" },
    { title: "Сальма Хайек", img: "https://upload.wikimedia.org/wikipedia/commons/9/94/Salma_Hayek-2012.jpg", link: "https://www.imdb.com/name/nm0000161/", svc: "imdb" },
    { title: "Джеки Чан", img: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Jackie_Chan_by_Gage_Skidmore.jpg", link: "https://www.imdb.com/name/nm0000329/", svc: "imdb" },
    { title: "Брюс Уиллис", img: "https://upload.wikimedia.org/wikipedia/commons/0/03/Bruce_Willis_by_Gage_Skidmore.jpg", link: "https://www.imdb.com/name/nm0000246/", svc: "imdb" },
    { title: "Сильвестр Сталлоне", img: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Sylvester_Stallone_2019.jpg", link: "https://www.imdb.com/name/nm0000230/", svc: "imdb" },
    { title: "Арнольд Шварценеггер", img: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Arnold_Schwarzenegger_by_Gage_Skidmore_4.jpg", link: "https://www.imdb.com/name/nm0000216/", svc: "imdb" },
    { title: "Клинт Иствуд", img: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Clint_Eastwood_at_2010_New_York_Film_Festival.jpg", link: "https://www.imdb.com/name/nm0000142/", svc: "imdb" }
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
