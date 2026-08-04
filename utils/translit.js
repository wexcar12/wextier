// Транслитерация кириллицы в латиницу для поиска. Дубликаты были в
// templates.js (мёртвая) и search.js — теперь один модуль.
const TRANSLIT_MAP = { а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'e', ж:'zh', з:'z', и:'i', й:'y', к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t', у:'u', ф:'f', х:'h', ц:'ts', ч:'ch', ш:'sh', щ:'sch', ъ:'', ы:'y', ь:'', э:'e', ю:'yu', я:'ya' };

export function translit(str) {
  return str.split('').map(ch => TRANSLIT_MAP[ch] !== undefined ? TRANSLIT_MAP[ch] : ch).join('');
}
