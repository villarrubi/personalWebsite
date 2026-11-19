// A small, coordinated palette: shared materials and contrast, distinct app accents.
const palettes={
 blue:{edge:'#254577',face:'#386bb0',detail:'#79aaf0',accent:'#a9ccff'},
 violet:{edge:'#493367',face:'#7553a0',detail:'#b098e1',accent:'#d2baf5'},
 teal:{edge:'#24564f',face:'#348574',detail:'#72c7a9',accent:'#a0e0ca'},
 amber:{edge:'#67472c',face:'#a1743e',detail:'#e4b56f',accent:'#f0ce98'},
 rose:{edge:'#663e54',face:'#a15e7b',detail:'#e3a0b9',accent:'#f1bad1'},
 cyan:{edge:'#255367',face:'#38849b',detail:'#77cada',accent:'#a6e1ed'}
};
const projectColours={chessbot:'blue',pipa:'violet',mapforge:'teal',phishing:'cyan',chessprep:'amber',deriva:'teal',aquilae:'amber',acuadros:'rose','club-palentino':'amber','atlas-celular':'violet',mapviewer:'cyan',trader:'teal',chatbot:'rose',lidar:'cyan','practica-web':'blue'};
export const projectTheme=id=>palettes[projectColours[id]]||palettes.blue;
export const projectAccent=id=>projectTheme(id).accent;
