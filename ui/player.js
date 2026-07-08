/**
 * @module ui/player
 * @description YouTube плеер в модалке.
 */

export function setupPlayer() {
  const closePlayer = document.getElementById('closePlayer');
  const playerModal = document.getElementById('playerModal');

  if (closePlayer) {
    closePlayer.onclick = () => {
      if (playerModal) playerModal.classList.remove('open');
      const frame = document.getElementById('playerFrame');
      if (frame) frame.src = 'about:blank';
    };
  }

  if (playerModal) {
    playerModal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('open');
        const frame = document.getElementById('playerFrame');
        if (frame) frame.src = 'about:blank';
      }
    });
  }
}