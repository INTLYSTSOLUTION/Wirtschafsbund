const menu = document.querySelector('.mobile-menu');
const summary = menu?.querySelector('summary');
menu?.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); }
});
menu?.addEventListener('click', event => { if (event.target.closest('a')) menu.open = false; });
document.addEventListener('click', event => { if (menu?.open && !menu.contains(event.target)) menu.open = false; });
matchMedia('(min-width: 901px)').addEventListener('change', () => { if(menu)menu.open=false; });

// Re-check the server session when returning from the browser's back/forward cache.
addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
