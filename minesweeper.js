// Elements ID
const RESET_BUTTON_ID = "reset-button";
const GAME_GRID_ID = "game-grid";

// mines
const MINE_DATA_ATTRIBUTE = "data-mine";

// Game board options
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
    resetButton.onclick = function() {
      self.generateGrid();
    };
  }

  generateGrid() {
    const self = this;

    this.gameGrid.innerHTML = "";

    for (let rowIndex = 0; rowIndex < GAME_GRID_ROWS_NUMBER; rowIndex++) {
      const row = this.gameGrid.insertRow(rowIndex);
      for (let cellIndex = 0; cellIndex < GAME_GRID_CELLS_NUMBER; cellIndex++) {
        const cell = row.insertCell(cellIndex);
        cell.onclick = function() {
          self.clickCell(this);
        };
        const mine = document.createAttribute(MINE_DATA_ATTRIBUTE);
        mine.value = "false";
        cell.setAttributeNode(mine);
      }
    }

    this.addMinesRandomly();
  }

  addMinesRandomly() {
    const mines_number = Math.floor(GAME_GRID_ROWS_NUMBER * GAME_GRID_CELLS_NUMBER * PERCENTAGE_OF_MINES);

    for (let index = 0; index < mines_number; index++) {
      const row = Math.floor(Math.random() * GAME_GRID_ROWS_NUMBER);
      const col = Math.floor(Math.random() * GAME_GRID_CELLS_NUMBER);
      const cell = this.gameGrid.rows[row].cells[col];
      cell.setAttribute(MINE_DATA_ATTRIBUTE, "true");
      if (testMode) {
        cell.innerHTML = "X";
      }
    }
  }

  revealMines() {
    const self = this;

    this.browseAllCells(function(rowIndex, cellIndex) {
      const cell = self.gameGrid.rows[rowIndex].cells[cellIndex];
      if (cell.getAttribute(MINE_DATA_ATTRIBUTE) == "true") {
        cell.className = "mine";
      }
    });
  }

  // Check if the user clicked on a mine
  clickCell(cell) {
    if (cell.getAttribute(MINE_DATA_ATTRIBUTE) == "true") {
      this.revealMines();

      this.showMessage("Game Over");
    } else {
      cell.className = "clicked";

      const mineCount = this.countAdjacentMines(cell);
      cell.innerHTML = mineCount;

      if (mineCount == 0) {
        this.revealAllAdjacentCells(cell);
      }

      this.checkLevelCompletion();
    }
  }

  countAdjacentMines(cell) {
    const self = this;
    let mineCount = 0;

    this.browseAdjacentCells(cell, function(rowIndex, cellIndex) {
      if (self.gameGrid.rows[rowIndex].cells[cellIndex].getAttribute(MINE_DATA_ATTRIBUTE) == "true") {
        mineCount++;
      }
    });
    return mineCount;
  }

  revealAllAdjacentCells(cell) {
    const self = this;

    this.browseAdjacentCells(cell, function(rowIndex, cellIndex) {
      const analyzedCell = self.gameGrid.rows[rowIndex].cells[cellIndex];
      if (analyzedCell.innerHTML == "") {
        self.clickCell(analyzedCell);
      }
    });
  }

  checkLevelCompletion() {
    const self = this;
    let levelComplete = true;
    let analyzedCell = null;

    this.browseAllCells(function(rowIndex, cellIndex) {
      analyzedCell = self.gameGrid.rows[rowIndex].cells[cellIndex];
      if ((analyzedCell.getAttribute(MINE_DATA_ATTRIBUTE) == "false") && (analyzedCell.innerHTML == "")) {
        levelComplete = false;
      }
    });

    if (levelComplete) {
      this.revealMines();

      this.showMessage("You Win!");
    }
  }

  // Tools

  browseAllCells(cb) {
    for (let rowIndex = 0; rowIndex < this.gameGrid.rows.length; rowIndex++) {
      for (let cellIndex = 0; cellIndex < this.gameGrid.rows[rowIndex].cells.length; cellIndex++) {
        cb(rowIndex, cellIndex);
      }
    }
  }

  browseAdjacentCells(cell, cb) {
    const cellRowPosition = cell.parentNode.rowIndex;
    const cellColPosition = cell.cellIndex;
    const maxRowPosition = GAME_GRID_ROWS_NUMBER - 1;
    const maxCellPosition = GAME_GRID_CELLS_NUMBER - 1;

    for (let rowIndex = Math.max(cellRowPosition - 1, 0); rowIndex <= Math.min(cellRowPosition + 1, maxRowPosition); rowIndex++) {
      for (let cellIndex = Math.max(cellColPosition - 1, 0); cellIndex <= Math.min(cellColPosition + 1, maxCellPosition); cellIndex++) {
        cb(rowIndex, cellIndex);
      }
    }
  }

  showMessage(message) {
    setTimeout(function() {
      alert(message);
    }, 100);
  }
}
