// Importo estilos generales
import '../sass/main.scss';

// Capturo los elementos del DOM
let boardElement = document.querySelector('#board');
let btnStart = document.querySelector('#btn-start');
let inputRows = document.querySelector('#input-rows');
let inputCols = document.querySelector('#input-cols');
let inputMines = document.querySelector('#input-mines');
let timeDisplay = document.querySelector('#time-display');
let bestTimeDisplay = document.querySelector('#best-time-display');
// Variables de estado
let board = [];
let rows = 8;
let cols = 8;
let mines = 10;
// Variables para controlar victorias y derrotas
let isGameOver = false;
let cellsRevealed = 0;
// Variables de tiempo
let timerInterval;
let timeElapsed = 0;
let timerStarted = false;


// Inicializa una nueva partida
function initGame(forceNew = false) {
  stopTimer();

  // Si no se fuerza partida nueva, intento cargar la guardada en LocalStore
  if (!forceNew && loadGame()) {
    renderBoard(); // Dibujo el tablero restaurado
    updateBestTimeDisplay(); // Muestro el récord
    if (timerStarted && !isGameOver) startTimer();
    return; 
  }

  rows = parseInt(inputRows.value);
  cols = parseInt(inputCols.value);
  mines = parseInt(inputMines.value);
  isGameOver = false;
  cellsRevealed = 0;
  timeElapsed = 0;
  timerStarted = false;
  timeDisplay.textContent = timeElapsed;
  updateBestTimeDisplay();

  // Limpio localStorage
  localStorage.removeItem("minesweeper_save");

  // Genero matriz vacía
  board = []; 
  for (let i = 0; i < rows; i++) {
    let fila = [];
    for (let j = 0; j < cols; j++) {
      fila.push({
        isMine: false,
        revealed: false,
        adjacentMines: 0,
        flagged: false
      });
    }
    board.push(fila);
  }

  // Coloco minas al azar
  let minasColocadas = 0;
  while (minasColocadas < mines) {
    let randRow = Math.floor(Math.random() * rows); 
    let randCol = Math.floor(Math.random() * cols); 

    if (!board[randRow][randCol].isMine) {
      board[randRow][randCol].isMine = true;
      minasColocadas++;
    }
  }

  // Calculo cuántas minas hay alrededor de cada celda vacía
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (!board[i][j].isMine) {
        // Asigno el número devuelto
        board[i][j].adjacentMines = countMines(i, j);
      }
    }
  }

  // --- LOGS DE TESTEO ---
  console.log("Contenedor del tablero (DOM):", boardElement);
  console.log("Matriz lógica completa:", board);

  renderBoard();
}

// Función independiente para dibujar el DOM
function renderBoard() {
  boardElement.innerHTML = ''; 
  boardElement.style.setProperty('--cols', cols);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let cellData = board[i][j];
      let cell = document.createElement("div"); 
      cell.classList.add("cell"); 
      cell.dataset.row = i; 
      cell.dataset.col = j; 

      // Si se carga partida aplica las clases a las celdas
      if (cellData.revealed) {
        cell.classList.add("revealed");
        if (cellData.isMine) {
          cell.classList.add("mine");
          cell.textContent = "💣";
        } else if (cellData.adjacentMines > 0) {
          cell.textContent = cellData.adjacentMines;
        }
      } else if (cellData.flagged) {
        cell.classList.add("flagged");
        cell.textContent = "🚩";
      }
      
      cell.addEventListener("click", handleCellClick); 
      cell.addEventListener("contextmenu", handleRightClick);
      boardElement.appendChild(cell); 
    }
  }
}

//----------------------------
// TEMPORIZADOR Y LOCALSTORAGE
//----------------------------
//Inicia temporizador, aumenta cada segundo y guarda saveGame
function startTimer() {
  timerInterval = setInterval(() => {
    if (!isGameOver) {
      timeElapsed++;
      timeDisplay.textContent = timeElapsed;
      saveGame(); // Guardo cada segundo
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// Guarda la partida transformando el objeto a JSON
function saveGame() {
  if (isGameOver) return; 
  let gameState = { board, rows, cols, mines, cellsRevealed, timeElapsed, timerStarted };
  localStorage.setItem('minesweeper_save', JSON.stringify(gameState));
}

// Recupera la partida de la sesión anterior
function loadGame() {
  let saved = JSON.parse(localStorage.getItem('minesweeper_save'));
  if (saved) {
    board = saved.board;
    rows = saved.rows;
    cols = saved.cols;
    mines = saved.mines;
    cellsRevealed = saved.cellsRevealed;
    timeElapsed = saved.timeElapsed;
    timerStarted = saved.timerStarted;
    
    // Actualiza la vista
    inputRows.value = rows;
    inputCols.value = cols;
    inputMines.value = mines;
    timeDisplay.textContent = timeElapsed;
    return true;
  }
  return false;
}

// Actualiza en el DOM el mejor tiempo según las reglas (ej: 8x8 con 10 minas)
function updateBestTimeDisplay() {
  let key = `best_time_${rows}_${cols}_${mines}`;
  let best = localStorage.getItem(key);
  bestTimeDisplay.textContent = best ? best : '---';
}

// Valida si se ha batido el récord
function checkBestTime() {
  let key = `best_time_${rows}_${cols}_${mines}`;
  let best = localStorage.getItem(key);
  if (!best || timeElapsed < parseInt(best)) {
    localStorage.setItem(key, timeElapsed);
    return true;
  }
  return false;
}

// Contar minas alrededor de una coordenada
function countMines(row, col) {
  let count = 0;
  // Usa un doble for que va desde -1 hasta 1 para mirar las 8 casillas vecinas
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      let newRow = row + x;
      let newCol = col + y;
      
      // Verifico que la posición vecina exista dentro de los límites
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        if (board[newRow][newCol].isMine) {
          count++;
        }
      }
    }
  }
  return count;
}

//------------------
// GESTIÓN DEL JUEGO
//------------------

// Función que se ejecuta al hacer clic en una celda
function handleCellClick(event) {
  // Si he perdido o ganado, ignoro los clics
  if (isGameOver) return;
  if (!timerStarted) {
    startTimer();
    timerStarted = true;
  }

  let cell = event.target; 
  let fila = parseInt(cell.dataset.row);
  let columna = parseInt(cell.dataset.col);
  
  // --- LOG DE TESTEO ---
  console.log(`Clic en la celda Visual: [${fila}, ${columna}]`);
  console.log(`Estado lógico de la celda:`, board[fila][columna]);


  // Si tiene una bandera puesta, no destaparla
  if (board[fila][columna].flagged) return;

  // Funcion revelar celda
  revealCell(fila, columna);
}

// Proceso el clic derecho del usuario para poner banderas
function handleRightClick(event) {
  // Evito el comportamiento por defecto (menú contextual del navegador)
  event.preventDefault(); 

  if (isGameOver) return;

  let cell = event.target;
  let fila = parseInt(cell.dataset.row);
  let columna = parseInt(cell.dataset.col);
  let cellData = board[fila][columna];

  // Si ya se ha destapado antes, ignoro el click
  if (cellData.revealed) return; 

  // Alterno el estado de la bandera
  cellData.flagged = !cellData.flagged;

  // Actualizo el DOM usando la clase flagged
  if (cellData.flagged) {
    cell.classList.add("flagged");
    cell.textContent = "🚩";
  } else {
    cell.classList.remove("flagged");
    cell.textContent = "";
  }
}

// Función principal para destapar mi celda
function revealCell(row, col) {
  // Verifico que mis coordenadas no se salgan del tablero
  if (row < 0 || row >= rows || col < 0 || col >= cols) return;

  let cellData = board[row][col];
  
  // Si ya la he destapado antes, o si tiene una bandera
  if (cellData.revealed || cellData.flagged) return; 

  // La marco como revelada
  cellData.revealed = true;

  // Busco el elemento exacto del DOM usando Data Attributes
  let cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  
  // Le añado la clase revealed
  cellElement.classList.add("revealed"); 

  // Si he pisado una mina
  if (cellData.isMine) {
    cellElement.classList.add("mine");
    cellElement.textContent = "💣";
    gameOver();
    return;
  }

  // Si es segura, aumento el contador
  cellsRevealed++;

  // Muestro el número si tiene minas cerca, o destapo el resto recursivamente si es 0
  if (cellData.adjacentMines > 0) {
    cellElement.textContent = cellData.adjacentMines;
  } else {
    // Mi for recursivo para destapar los huecos adyacentes
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        revealCell(row + x, col + y);
      }
    }
  }

  // Compruebo si he ganado
  checkWin();
}

// Game over
function gameOver() {
  isGameOver = true;
  
  // Muestra dónde estaban ocultas las demás minas
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (board[i][j].isMine) {
        let cellElement = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
        cellElement.classList.add("mine", "revealed");
        cellElement.textContent = "💣";
      }
    }
  }
  
  // Aviso al navegador
  setTimeout(() => alert("¡Boom! Has pisado una mina en el segundo " + timeElapsed + ". Fin de la partida."), 100);
}

// Comprueba si se han destapado todas las celdas seguras
function checkWin() {
  let totalSafeCells = (rows * cols) - mines;
  if (cellsRevealed === totalSafeCells) {
    isGameOver = true;
    stopTimer();
    localStorage.removeItem("minesweeper_save"); // Borro guardado al ganar
    
    // Verifico el récord
    let isNewRecord = checkBestTime();
    updateBestTimeDisplay();

    setTimeout(() => {
      let msg = `¡Módulo completado! Has desactivado la zona en ${timeElapsed} segundos.`;
      if (isNewRecord) {
          msg += `\n¡NUEVO RÉCORD de tiempo para la categoría ${rows}x${cols} con ${mines} minas!`;
      }
      alert(msg);
    }, 100);
  }
}

// Escucho eventos generales
btnStart.addEventListener('click', () => initGame(true));

// Cuando carga la página, verifica si hay guardado
window.addEventListener('DOMContentLoaded', () => initGame(false));