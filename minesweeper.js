const minesweeper = {
  mines: 0, // Cantidad de minas.
  minesFound: 0, // Minas encontradas.
  rows: 0, // Filas del tablero.
  columns: 0, // Columnas del tablero.
  arrayDashboard: [], // Array del tablero.
};

// Creo el tablero:
function paintDashboard(rows, columns) {
  let dashboard = document.querySelector("#dashboard");

  while (dashboard.firstChild) {
    dashboard.firstChild.removeEventListener("contextmenu", paint);
    dashboard.firstChild.removeEventListener("click", uncover);
    dashboard.removeChild(dashboard.firstChild);
  }

  for (let f = 0; f < minesweeper.rows; f++) {
    for (let c = 0; c < minesweeper.columns; c++) {
      let newDiv = document.createElement("div");
      newDiv.setAttribute("id", "f" + f + "_c" + c);
      newDiv.dataset.row = f;
      newDiv.dataset.column = c;
      newDiv.addEventListener("contextmenu", paint);
      newDiv.addEventListener("click", uncover);

      dashboard.appendChild(newDiv);
    }
  }
}

// Tablero vacío:
function emptyDashboard() {
  minesweeper.arrayDashboard = new Array(minesweeper.rows);
  for (let row = 0; row < minesweeper.rows; row++) {
    minesweeper.arrayDashboard[row] = new Array(minesweeper.columns);
  }
}

// Colocación de bombas:
function minefield() {
  let minesPlanted = 0;

  while (minesPlanted < minesweeper.mines) {
    let row = Math.floor(Math.random() * minesweeper.rows);
    let column = Math.floor(Math.random() * minesweeper.columns);

    // Verificando que no haya bomba:
    if (minesweeper.arrayDashboard[row][column] != "B") {
      minesweeper.arrayDashboard[row][column] = "B";
      minesPlanted++;
    }
  }
}

// Verificar bombas cercanas:
function countNearbyMines(fila, columna) {
  let nearbyMines = 0;

  // De la fila anterior a la posterior:
  for (let zFila = fila - 1; zFila <= fila + 1; zFila++) {
    // De la columna anterior a la posterior:
    for (let zColumna = columna - 1; zColumna <= columna + 1; zColumna++) {
      // Si la casilla está en el tablero:
      if (
        zFila > -1 &&
        zFila < minesweeper.rows &&
        zColumna > -1 &&
        zColumna < minesweeper.columns
      ) {
        // Verificamos si hay bomba en esa posición:
        if (minesweeper.arrayDashboard[zFila][zColumna] == "B") {
          nearbyMines++;
        }
      }
    }
  }
  minesweeper.arrayDashboard[fila][columna] = nearbyMines;
}

// Contador de bombas cercanas:
function countMines() {
  // Minas alrededor de cada casilla.
  for (let fila = 0; fila < minesweeper.rows; fila++) {
    for (let columna = 0; columna < minesweeper.columns; columna++) {
      // Si es distinto a bomba.
      if (minesweeper.arrayDashboard[fila][columna] != "B") {
        countNearbyMines(fila, columna);
      }
    }
  }
}

function paint(miEvento) {
  if (miEvento.type === "contextmenu") {
    console.log(miEvento);

    // Evento que dispara el evento:
    let box = miEvento.currentTarget;
    miEvento.stopPropagation();
    miEvento.preventDefault();

    // Propiedades del dataset:
    let row = parseInt(box.dataset.row, 10);
    let column = parseInt(box.dataset.column, 10);

    if (
      row >= 0 &&
      column >= 0 &&
      row < minesweeper.rows &&
      column < minesweeper.columns
    ) {
      // Si estaba marcado como bandera:
      if (box.classList.contains("icon-flag")) {
        // Borro, marcomo como duda y resto minas entontradas:
        box.classList.remove("icon-flag");
        box.classList.add("icon-doubt");
        minesweeper.minesFound--;
      } else if (box.classList.contains("icon-doubt")) {
        // Si estaba como duda lo borro:
        box.classList.remove("icon-doubt");
      } else if (box.classList.length == 0) {
        // Si no estaba marcado, lo marco como bandera:
        box.classList.add("icon-flag");
        // Sumo una mina encontrada:
        minesweeper.minesFound++;
        // Si minas encontradas y minas totales coinciden, resuelvo:
        if (minesweeper.minesFound == minesweeper.mines) {
          solveBoard(true);
        }
      }
      remainingMines();
    }
  }
}

function uncover(miEvento) {
  if (miEvento.type === "click") {
    let box = miEvento.currentTarget;
    let row = box.dataset.row;
    let column = box.dataset.column;

    uncoverBox(row, column);
  }
}

// Mostrar casillero:
function uncoverBox(row, column) {
  console.log("Uncovering row " + row + " and column " + column);
  // Verificar que la casilla esté en el tablero:
  if (
    row > -1 &&
    row < minesweeper.rows &&
    column > -1 &&
    column < minesweeper.columns
  ) {
    let box = document.querySelector("#f" + row + "_c" + column);

    // Si la casilla no está destapada, la destapamos:
    if (!box.classList.contains("uncovered")) {
      box.classList.add("uncovered");

      // Número de minas que tiene alrededor:
      box.innerHTML = minesweeper.arrayDashboard[row][column];

      // Verificamos que no sea una bomba:
      if (minesweeper.arrayDashboard[row][column] !== "B") {
        // Si no hay minas alrededor, entonces destapamos:
        if (minesweeper.arrayDashboard[row][column] == 0) {
          uncoverBox(row - 1, column - 1);
          uncoverBox(row - 1, column);
          uncoverBox(row - 1, column + 1);
          uncoverBox(row, column - 1);
          uncoverBox(row, column + 1);
          uncoverBox(row + 1, column - 1);
          uncoverBox(row + 1, column);
          uncoverBox(row + 1, column + 1);
          // Borramos el cero para que no se vea:
          box.innerHTML = "";
        }
      } else if (minesweeper.arrayDashboard[row][column] == "B") {
        alert("¡Perdiste!");
        start();
      }
    }
  }
}

function solveBoard(isOK) {
  let aBoxes = dashboard.children;
  for (let i = 0; i < aBoxes.length; i++) {
    // Saco EventListener:
    aBoxes[i].removeEventListener("click", uncover);
    aBoxes[i].removeEventListener("contextmenu", paint);

    let row = parseInt(aBoxes[i].dataset.row, 10);
    let column = parseInt(aBoxes[i].dataset.column, 10);

    if (aBoxes[i].classList.contains("icon-flag")) {
      if (minesweeper.arrayDashboard[row][column] == "B") {
        // Si la bandera es correcta:
        aBoxes[i].classList.add("uncovered");
        aBoxes[i].classList.remove("icon-flag");
        aBoxes[i].classList.add("icon-mine");
      } else {
        // Si la bandera está mal puesta:
        aBoxes[i].classList.add("uncovered");
        isOK = false;
      }
    } else if (!aBoxes[i].classList.contains("uncovered")) {
      if (minesweeper.arrayDashboard[row][column] == "B") {
        // Mostramos el resto de las bombas:
        aBoxes[i].classList.add("uncovered");
        aBoxes[i].classList.add("icon-mine");
        isOK = false;
      }
    }
  }

  if (isOK) {
    alert("¡Ganaste!");
    start();
  } else {
    alert("¡Perdiste!");
    start();
  }
}

function remainingMines() {
  document.querySelector("#remaining").innerHTML =
    minesweeper.mines - minesweeper.minesFound;
}

// Inicializo el juego:
function start() {
  minesweeper.rows = 10;
  minesweeper.columns = 10;
  minesweeper.mines = 10;
  minesweeper.minesFound = 0;
  paintDashboard();
  emptyDashboard();
  remainingMines();
  minefield();
  countMines();
}

// Llamamos a la función start cuando se cargue la ventana:
window.onload = start;
