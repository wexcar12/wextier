/**
 * @module app
 * @description Инициализация WEX-TIER (Enterprise Version)
 */

import { eventBus } from './core/event-bus.js';
import { state, AddItemCommand } from './core/state.js';
import { escapeHTML } from './utils/sanitizers.js';
import { initFB } from './api/firebase-init.js';
import { initAuthObserver, loginWithGoogle, logout } from './api/auth.js';
import { renderAll, isEditing, setEditing, isCompare, setCompare, getActiveTier, getActiveList, setActiveTier, updateUI, updateUndo } from './ui/render.js';
import { openGallery, openTop, openUserDashboard } from './ui/gallery.js';
import { openDuel, setupDuelButtons } from './ui/duel.js';
import { openCommentsModal } from './ui/comments.js';
import { loadAchievements, checkAchievements, openAchievementsModal } from './ui/achievements.js';
import { loadNeon, openNeonModal } from './ui/neon.js';
import { loadParallax, toggleParallax, initParallaxMouse } from './ui/parallax.js';
import { updatePoolItems, renderTemplatePool } from './ui/templates.js';
import { loadDrafts, createNewDraft, clearAllData, renderDraftsSidebar } from './ui/drafts.js';
import { exportPNG, exportJSON, importJSON } from './ui/export.js';
import { shareTierlist, loadFromURL } from './ui/share.js';
import { setupSearch } from './ui/search.js';
import { loadSettings, toggleTheme, toggleSidebar } from './ui/settings.js';
import { initSortable } from './dragdrop/sortable.js';

window.escapeHTML = escapeHTML;

async function init() {
    initFB();
    loadSettings();
    loadDrafts();
    loadAchievements();
    loadNeon();
    loadParallax();
    setupSearch();
    setupDuelButtons();
    initSortable();
    initParallaxMouse();
    initAuthObserver();

    await loadFromURL();
    renderAll();
    renderDraftsSidebar();
    bindEvents();
    updateUI();
}

function bindEvents() {
    // UI Кнопки
    document.getElementById('toggleSidebarBtn')?.addEventListener('click', toggleSidebar);
    document.getElementById('burgerBtn')?.addEventListener('click', () => document.getElementById('sidebar')?.classList.toggle('open'));
    document.getElementById('themeBtn')?.addEventListener('click', toggleTheme);
    document.getElementById('neonBtn')?.addEventListener('click', openNeonModal);
    document.getElementById('parallaxBtn')?.addEventListener('click', () => toggleParallax(true));
    
    document.getElementById('editBtn')?.addEventListener('click', () => {
        setEditing(!isEditing());
        renderAll();
        updateUI();
    });

    document.getElementById('undoBtn')?.addEventListener('click', () => {
        state.undo(isCompare() ? 2 : 1);
        renderAll();
        updateUndo();
    });

    // Обработка кликов внутри тиров (Делегирование)
    document.getElementById('compareWrap')?.addEventListener('click', function(e) {
        const addBtn = e.target.closest('.add-btn');
        if (addBtn) {
            setActiveTier(parseInt(addBtn.dataset.tierIndex), parseInt(addBtn.dataset.listNum));
            document.getElementById('addModal').classList.add('open');
        }
    });

    // Модалка добавления
    document.getElementById('okAdd')?.addEventListener('click', () => {
        const url = escapeHTML(document.getElementById('trackUrl').value);
        const img = escapeHTML(document.getElementById('coverUrl').value) || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        const svc = document.getElementById('svc').value;
        
        // Правильная мутация через Command
        const cmd = new AddItemCommand(getActiveTier(), { img, url, svc }, getActiveList());
        state.executeCommand(cmd, getActiveList());
        
        document.getElementById('addModal').classList.remove('open');
        renderAll();
    });

    // Ctrl+Z
    window.addEventListener('keydown', e => {
        if(e.ctrlKey && e.key === 'z') { e.preventDefault(); state.undo(isCompare() ? 2 : 1); renderAll(); }
    });
}

document.addEventListener('DOMContentLoaded', init);
