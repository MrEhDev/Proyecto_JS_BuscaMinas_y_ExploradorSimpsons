// Importo mis estilos generales
import '../sass/main.scss';

// Capturo los elementos del DOM
const boardElement = document.querySelector('#board');
const btnStart = document.querySelector('#btn-start');
const inputRows = document.querySelector('#input-rows');
const inputCols = document.querySelector('#input-cols');
const inputMines = document.querySelector('#input-mines');

// Variables de estado
let board = [];
let rows = 8;
let cols = 8;
let mines = 10;

// Variables para controlar victorias y derrotas
let isGameOver = false;
let cellsRevealed = 0;

// Inicializa una nueva partida
function initGame() {
    rows = parseInt(inputRows.value);
    cols = parseInt(inputCols.value);
    mines = parseInt(inputMines.value);

    
    isGameOver = false;
    cellsRevealed = 0;
    boardElement.innerHTML = '';
    boardElement.style.setProperty('--cols', cols);

    // Genero matriz vacía
    board = []; 
    for (let i = 0; i < rows; i++) {
        const fila = [];
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
        const randRow = Math.floor(Math.random() * rows); 
        const randCol = Math.floor(Math.random() * cols); 

        if (!board[randRow][randCol].isMine) {
            board[randRow][randCol].isMine = true;
            minasColocadas++;
        }
    }

    // Calculo cuántas minas hay alrededor de cada celda vacía
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!board[i][j].isMine) {
                // Asigno el número devuelto por mi función auxiliar
                board[i][j].adjacentMines = countMines(i, j);
            }
        }
    }

    // --- LOGS DE TESTEO ---
    console.log("Contenedor del tablero (DOM):", boardElement);
    console.log("Matriz lógica completa:", board);

    // Bucle anidado para inyectar en el DOM
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement("div"); 
            cell.classList.add("cell"); 
            cell.dataset.row = i; 
            cell.dataset.col = j; 
            
            // Escucho Click izquierdo normal
            cell.addEventListener("click", handleCellClick); 
            
            // Escucho Click derecho (contextmenu) para las banderas
            cell.addEventListener("contextmenu", handleRightClick);

            boardElement.appendChild(cell); 
        }
    }
}

// Función auxiliar para contar minas alrededor de una coordenada
function countMines(row, col) {
    let count = 0;
    // Uso un doble bucle que va desde -1 hasta 1 para mirar las 8 casillas vecinas
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            const newRow = row + x;
            const newCol = col + y;
            
            // Verifico que la posición vecina exista dentro de los límites de mi matriz
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                if (board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
    }
    return count;
}

// Función que se ejecuta al hacer clic en una celda
function handleCellClick(event) {
    // Si he perdido o ganado, ignoro los clics
    if (isGameOver) return;

    const cell = event.target; 
    const fila = parseInt(cell.dataset.row);
    const columna = parseInt(cell.dataset.col);
    
    // --- LOG DE TESTEO ---
    console.log(`Clic en la celda Visual: [${fila}, ${columna}]`);
    console.log(`Estado lógico de la celda:`, board[fila][columna]);

    
    // Si tiene una bandera puesta, no permito destaparla
    if (board[fila][columna].flagged) return;

    // Ejecuto función para revelar la celda
    revealCell(fila, columna);
}

// NUEVO: Proceso el clic derecho del usuario para poner banderas
function handleRightClick(event) {
    // Evito el comportamiento por defecto (que salga el menú contextual del navegador) [1]
    event.preventDefault(); 

    if (isGameOver) return;

    const cell = event.target;
    const fila = parseInt(cell.dataset.row);
    const columna = parseInt(cell.dataset.col);
    const cellData = board[fila][columna];

    // Si ya la he destapado antes, ignoro el click
    if (cellData.revealed) return; 

    // Alterno el estado lógico de la bandera
    cellData.flagged = !cellData.flagged;

    // Actualizo el DOM usando la clase CSS que he preparado
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

    const cellData = board[row][col];
    
    // Si ya la he destapado antes, o si tiene una bandera
    if (cellData.revealed || cellData.flagged) return; 

    // La marco como revelada en mi memoria
    cellData.revealed = true;

    // Busco el elemento exacto del DOM usando mis Data Attributes
    const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    
    // Le añado la clase CSS que he preparado
    cellElement.classList.add("revealed"); 

    // ¿He pisado una mina?
    if (cellData.isMine) {
        cellElement.classList.add("mine");
        cellElement.textContent = "💣"; // Escribo el icono en la celda
        gameOver(); // Termino la partida
        return;
    }

    // Si es segura, aumento mi contador de victoria
    cellsRevealed++;

    // Muestro el número si tiene minas cerca, o destapo el resto recursivamente si es 0
    if (cellData.adjacentMines > 0) {
        cellElement.textContent = cellData.adjacentMines;
    } else {
        // Mi bucle recursivo para destapar los huecos adyacentes
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                revealCell(row + x, col + y);
            }
        }
    }

    // Compruebo si he ganado
    checkWin();
}

// Finalizo la partida con derrota
function gameOver() {
    isGameOver = true;
    
    // Recorro toda mi matriz para mostrar dónde estaban ocultas las demás minas
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j].isMine) {
                const cellElement = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                cellElement.classList.add("mine", "revealed");
                cellElement.textContent = "💣";
            }
        }
    }
    
    // Lanzo un aviso básico al navegador (podremos mejorarlo visualmente más tarde)
    setTimeout(() => alert("¡Boom! Has pisado una mina. Fin de la partida."), 100);
}

// Compruebo si he destapado todas mis casillas seguras
function checkWin() {
    // Calculo cuántas casillas no son minas
    const totalSafeCells = (rows * cols) - mines;
    
    if (cellsRevealed === totalSafeCells) {
        isGameOver = true;
        setTimeout(() => alert("¡Módulo completado! Has desactivado la zona."), 100);
    }
}

// Escucho mi botón y lanzo la partida inicial
btnStart.addEventListener('click', initGame);
initGame();