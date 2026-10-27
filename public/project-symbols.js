// Small original marks, shared by static HTML and the project cards.
const symbols={
 chessbot:'<path d="M7 27h19v3H6v-3Zm3-4c-1-6 3-9 7-12l-6 2-4-3 6-7 6-2 2-4 4 6c5 4 5 12 2 20H10Z" transform="translate(0 3)"/><path d="m16 10 2-1"/>',
 chessprep:'<path d="M7 27h19v3H6v-3Zm3-4c-1-6 3-9 7-12l-6 2-4-3 6-7 6-2 2-4 4 6c5 4 5 12 2 20H10Z" transform="translate(0 3)"/><path d="M26 6h5m-2.5-2.5v5"/>',
 pipa:'<rect x="5" y="8" width="24" height="20" rx="6"/><path d="M17 3v5M2 15v7m30-7v7M11 16v4m12-4v4M13 24h8"/>',
 mapforge:'<path d="m3 7 9-3 10 4 9-4v23l-9 4-10-4-9 4V7Zm9-3v23M22 8v23"/><path d="m7 20 5-6 5 6 5-4 5 5"/>',
 phishing:'<path d="m17 3 12 5v9c0 8-12 14-12 14S5 25 5 17V8l12-5Z"/><path d="m11 17 4 4 8-9"/>',
 deriva:'<path d="M9 26c-5-15 4-21 19-21 0 15-6 24-19 21Zm0 0 14-15"/><path d="M6 20c-5-3-4-8 0-12m3 18-4 4"/>',
 aquilae:'<path d="m3 11 14-8 14 8H3Zm1 18h26M7 14v12m7-12v12m7-12v12m7-12v12M5 14h24M3 31h28"/>',
 acuadros:'<rect x="4" y="6" width="26" height="25" rx="3"/><path d="M4 13h26M11 3v7m12-7v7M10 19h3m8 0h3m-14 6h3m8 0h3"/>',
 'atlas-celular':'<path d="M28 9c7 8 3 17-5 21C13 35 3 27 3 18 2 8 10 2 18 3c4 0 7 3 10 6Z"/><ellipse cx="17" cy="17" rx="6" ry="5"/><circle cx="18" cy="17" r="1.5"/><path d="m7 12 3 1m12 11 3-1m-14 3 2-2m11-15 2 2"/>',
 'club-palentino':'<path d="M10 29h14M9 25h16M12 25l2-14h6l2 14M11 11V5h4v3h4V5h4v6H11Z"/><path d="M8 24C1 19 2 10 6 7m20 17c7-5 6-14 2-17"/>',
 mapviewer:'<circle cx="17" cy="17" r="13"/><ellipse cx="17" cy="17" rx="6" ry="13"/><path d="M4 17h26M6 10h22M6 24h22"/>',
 trader:'<path d="M4 4v26h27M11 10v15m8-19v15m8-9v15"/><path d="M8 14h6v7H8Zm8-5h6v8h-6Zm8 7h6v7h-6Z"/>',
 chatbot:'<path d="M7 5h20a5 5 0 0 1 5 5v13a5 5 0 0 1-5 5H15l-8 5v-5a5 5 0 0 1-5-5V10a5 5 0 0 1 5-5Z"/><circle cx="10" cy="16" r="1"/><circle cx="17" cy="16" r="1"/><circle cx="24" cy="16" r="1"/>',
 lidar:'<circle cx="17" cy="17" r="13"/><circle cx="17" cy="17" r="8"/><path d="m17 17 10-10M17 4v3m0 20v3M4 17h3m20 0h3"/><circle cx="22" cy="12" r="2"/>',
 'practica-web':'<rect x="2" y="5" width="30" height="24" rx="3"/><path d="M2 11h30M7 8h1m3 0h1m-1 9-4 4 4 4m12-8 4 4-4 4m-4-10-4 12"/>'
};
export function projectSymbol(id){
 return `<svg viewBox="0 0 34 36" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[id]||symbols['practica-web']}</svg>`;
}
