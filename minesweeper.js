// Elements ID
const RESET_BUTTON_ID = 'reset-button';
const GAME_GRID_ID = 'game-grid';

// mines data attribute
const MINE_DATA_ATTRIBUTE = 'data-mine';

// Game board settings
const GAME_GRID_ROWS_NUMBER = 20;
const GAME_GRID_CELLS_NUMBER = 30;

const PERCENTAGE_OF_MINES = 0.2;

// Turn this variable to true to see where the mines are
const testMode = true;

class Minesweeper {
  constructor() {
    this.gameGrid = document.getElementById(GAME_GRID_ID);

    this.bindEvent();

    this.generateGrid();
  }

  bindEvent() {
    const self = this;

    const resetButton = document.getElementById(RESET_BUTTON_ID);
    resetButton.onclick = function () {
      self.generateGrid();
    };
  }

  generateGrid() {
    this.gameGrid.innerHTML = '';

    for (let rowIndex = 0; rowIndex < GAME_GRID_ROWS_NUMBER; rowIndex++) {
      const row = this.gameGrid.insertRow(rowIndex);
      for (let colIndex = 0; colIndex < GAME_GRID_CELLS_NUMBER; colIndex++) {
        this.generateCell(row, colIndex);
      }
    }

    this.addMinesRandomly();
  }

  generateCell(row, colIndex) {
    const self = this;
    const cell = row.insertCell(colIndex);

    cell.onclick = function () {
      self.clickCell(this);
    };
    cell.oncontextmenu = function (e) {
      self.rightClickCell(this);
      e.preventDefault();
    }

    const mine = document.createAttribute(MINE_DATA_ATTRIBUTE);
    mine.value = 'false';
    cell.setAttributeNode(mine);
  }

  addMinesRandomly() {
    const minesNumber = Math.floor(
      GAME_GRID_ROWS_NUMBER * GAME_GRID_CELLS_NUMBER * PERCENTAGE_OF_MINES,
    );

    for (let index = 0; index < minesNumber; index++) {
      const row = Math.floor(Math.random() * GAME_GRID_ROWS_NUMBER);
      const col = Math.floor(Math.random() * GAME_GRID_CELLS_NUMBER);
      const cell = this.gameGrid.rows[row].cells[col];
      cell.setAttribute(MINE_DATA_ATTRIBUTE, 'true');
      if (testMode) {
        cell.innerHTML = 'X';
      }
    }
  }

  revealMines() {
    const self = this;

    this.browseAllCells((rowIndex, cellIndex) => {
      const cell = self.gameGrid.rows[rowIndex].cells[cellIndex];
      if (cell.getAttribute(MINE_DATA_ATTRIBUTE) === 'true') {
        cell.className = 'mine';
      }
    });
  }

  // Check if the user clicked on a mine
  clickCell(cell) {
    if (cell.getAttribute(MINE_DATA_ATTRIBUTE) === 'true') {
      this.revealMines();

      this.showMessage('Game Over');
    } else {
      cell.className = 'clicked';

      const mineCount = this.countAdjacentMines(cell);
      cell.innerHTML = mineCount;

      if (mineCount === 0) {
        this.revealAllAdjacentCells(cell);
      }

      this.checkLevelCompletion();
    }
  }

  rightClickCell(cell) {
    if (!cell.classList.contains("clicked")) {
      cell.classList.toggle("flag");
    }
  }

  countAdjacentMines(cell) {
    const self = this;
    let mineCount = 0;

    this.browseAdjacentCells(cell, (rowIndex, cellIndex) => {
      if (self.gameGrid.rows[rowIndex].cells[cellIndex].getAttribute(MINE_DATA_ATTRIBUTE) === 'true') {
        mineCount++;
      }
    });
    return mineCount;
  }

  revealAllAdjacentCells(cell) {
    const self = this;

    this.browseAdjacentCells(cell, (rowIndex, cellIndex) => {
      const analyzedCell = self.gameGrid.rows[rowIndex].cells[cellIndex];
      if (analyzedCell.innerHTML === '') {
        self.clickCell(analyzedCell);
      }
    });
  }

  checkLevelCompletion() {
    const self = this;
    let levelComplete = true;
    let analyzedCell = null;

    this.browseAllCells((rowIndex, cellIndex) => {
      analyzedCell = self.gameGrid.rows[rowIndex].cells[cellIndex];
      if ((analyzedCell.getAttribute(MINE_DATA_ATTRIBUTE) === 'false') && (analyzedCell.innerHTML === '')) {
        levelComplete = false;
      }
    });

    if (levelComplete) {
      this.revealMines();

      this.showMessage('You Win!');
    }
  }

  // Tools

  browseAllCells(cb) {
    for (let rowIndex = 0; rowIndex < this.gameGrid.rows.length; rowIndex++) {
      for (let colIndex = 0; colIndex < this.gameGrid.rows[rowIndex].cells.length; colIndex++) {
        cb(rowIndex, colIndex);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  browseAdjacentCells(cell, cb) {
    const cellRowPosition = cell.parentNode.rowIndex;
    const cellColPosition = cell.cellIndex;

    const maxRowPosition = GAME_GRID_ROWS_NUMBER - 1;
    const maxColPosition = GAME_GRID_CELLS_NUMBER - 1;

    const startRowIndex = Math.max(cellRowPosition - 1, 0);
    const endRowIndex = Math.min(cellRowPosition + 1, maxRowPosition);

    for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex++) {
      const startCellIndex = Math.max(cellColPosition - 1, 0);
      const endCellIndex = Math.min(cellColPosition + 1, maxColPosition);
      for (let colIndex = startCellIndex; colIndex <= endCellIndex; colIndex++) {
        cb(rowIndex, colIndex);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  showMessage(message) {
    setTimeout(() => {
      alert(message); // eslint-disable-line no-alert
    }, 100);
  }
}
