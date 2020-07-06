const GAME_GRID_ID = "game-grid";

// Dashborad elements ids
const REMAINING_MINES_COUNTER_INFO_ID = "remaining-mines-counter-info";
const RESET_BUTTON_ID = "reset-button";
const TIMER_INFO = "timer-info";

const OVERLAY = "overlay";

// Setting elements ids
const SETTINGS_BUTTON_ID = "settings-button";
const SETTINGS_PANEL_ID = "settings-panel";
const SETTINGS_APPLY_BUTTON_ID = "settings-apply-button";
const SETTINGS_SIZE_SELECT_ID = "settings-size-select";
const SETTINGS_LEVEL_SELECT_ID = "settings-level-select";

// Mines data attribute
const MINE_DATA_ATTRIBUTE = "data-mine";

// Game settings
const MAP_SIZES = {
  small: [10, 10],
  medium: [20, 20],
  large: [20, 40],
};
const LEVELS = {
  easy: 0.1,
  medium: 0.2,
  hard: 0.3,
};

const TIMER_INITIAL_VALUE = 99;

// Turn this variable to true to see where the mines are
const testMode = true;

class Minesweeper {
  constructor() {
    this.gameGrid = this.domElement(GAME_GRID_ID);

    this.initSettings();
    this.bindEvent();
    this.startGame();
    this.refreshLayout();
  }

  bindEvent() {
    const self = this;

    const resetButton = this.domElement(RESET_BUTTON_ID);
    resetButton.onclick = function () {
      self.stopCountdown();
      self.startGame();
    };

    const settingsButton = this.domElement(SETTINGS_BUTTON_ID);
    settingsButton.onclick = function () {
      self.isShowSettings = !self.isShowSettings;
      self.refreshLayout();
    };

    const applySettingsButton = this.domElement(SETTINGS_APPLY_BUTTON_ID);
    applySettingsButton.onclick = function () {
      self.changeSettings();
      self.startGame();

      self.isShowSettings = false;
      self.refreshLayout();
    };
  }

  refreshLayout() {
    if (this.isShowSettings) {
      this.show(OVERLAY);
      this.show(SETTINGS_PANEL_ID);
    } else {
      this.hide(OVERLAY);
      this.hide(SETTINGS_PANEL_ID);
    }
  }

  initSettings() {
    this.isShowSettings = false;

    const [rowsNumber, colsNumber] = MAP_SIZES.small;
    this.gameGridRowsNumber = rowsNumber;
    this.gameGridColsNumber = colsNumber;

    this.percentageOfMines = LEVELS.medium;

    this.initSettingsPanel();
  }

  initSettingsPanel() {
    this.populateSelect(SETTINGS_SIZE_SELECT_ID, Object.keys(MAP_SIZES));
    this.populateSelect(SETTINGS_LEVEL_SELECT_ID, Object.keys(LEVELS));
  }

  changeSettings() {
    const settingsSizeSelect = this.domElement(SETTINGS_SIZE_SELECT_ID);
    const [rowsNumber, colsNumber] = MAP_SIZES[settingsSizeSelect.value];
    this.gameGridRowsNumber = rowsNumber;
    this.gameGridColsNumber = colsNumber;

    const settingsLevelSelect = this.domElement(SETTINGS_LEVEL_SELECT_ID);
    this.percentageOfMines = LEVELS[settingsLevelSelect.value];
  }

  startGame() {
    this.minesNumber = 0;
    this.revealMinesCounter = 0;
    this.countdownValue = TIMER_INITIAL_VALUE;
    this.playTimer = null;

    this.generateGrid();
    this.refreshTimerInfo();
  }

  stopGame() {
    this.stopCountdown();
    this.revealMines();
  }

  generateGrid() {
    this.gameGrid.innerHTML = "";

    for (let rowIndex = 0; rowIndex < this.gameGridRowsNumber; rowIndex++) {
      const row = this.gameGrid.insertRow(rowIndex);
      for (let colIndex = 0; colIndex < this.gameGridColsNumber; colIndex++) {
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
    };

    const mine = document.createAttribute(MINE_DATA_ATTRIBUTE);
    mine.value = "false";
    cell.setAttributeNode(mine);
  }

  addMinesRandomly() {
    this.minesNumber = Math.min(
      99,
      Math.floor(this.gameGridRowsNumber * this.gameGridColsNumber * this.percentageOfMines),
    );

    for (let index = 0; index < this.minesNumber; index++) {
      const row = Math.floor(Math.random() * this.gameGridRowsNumber);
      const col = Math.floor(Math.random() * this.gameGridColsNumber);
      const cell = this.gameGrid.rows[row].cells[col];
      cell.setAttribute(MINE_DATA_ATTRIBUTE, "true");
      if (testMode) {
        cell.innerHTML = "X";
      }
    }

    this.refreshMinesCounter();
  }

  revealMines() {
    const self = this;

    this.browseAllCells((rowIndex, cellIndex) => {
      const cell = self.gameGrid.rows[rowIndex].cells[cellIndex];
      if (cell.getAttribute(MINE_DATA_ATTRIBUTE) === "true") {
        cell.className = "mine";
      }
    });
  }

  // Check if the user clicked on a mine
  clickCell(cell) {
    this.handleStartCountdown();

    if (cell.getAttribute(MINE_DATA_ATTRIBUTE) === "true") {
      this.stopGame();
      this.showMessage("Game Over");
    } else {
      cell.className = "clicked";

      const mineCount = this.countAdjacentMines(cell);
      cell.innerHTML = mineCount;

      if (mineCount === 0) {
        this.revealAllAdjacentCells(cell);
      }

      this.checkLevelCompletion();
    }
  }

  rightClickCell(cell) {
    this.handleStartCountdown();

    if (!cell.classList.contains("clicked")) {
      cell.classList.toggle("flag");
      if (cell.classList.contains("flag")) {
        this.revealMinesCounter++;
      } else {
        this.revealMinesCounter--;
      }

      this.refreshMinesCounter();
    }
  }

  refreshMinesCounter() {
    const remainingMinesCounterInfo = this.domElement(REMAINING_MINES_COUNTER_INFO_ID);
    const remainingMinesCounter = this.minesNumber - this.revealMinesCounter;
    remainingMinesCounterInfo.innerHTML = this.formatOnTwoDigits(remainingMinesCounter);
  }

  refreshTimerInfo() {
    const timerInfo = this.domElement(TIMER_INFO);
    timerInfo.innerHTML = this.formatOnTwoDigits(this.countdownValue);
  }

  countAdjacentMines(cell) {
    const self = this;
    let mineCount = 0;

    this.browseAdjacentCells(cell, (rowIndex, cellIndex) => {
      if (self.gameGrid.rows[rowIndex].cells[cellIndex].getAttribute(MINE_DATA_ATTRIBUTE) === "true") {
        mineCount++;
      }
    });
    return mineCount;
  }

  revealAllAdjacentCells(cell) {
    const self = this;

    this.browseAdjacentCells(cell, (rowIndex, cellIndex) => {
      const analyzedCell = self.gameGrid.rows[rowIndex].cells[cellIndex];
      if (analyzedCell.innerHTML === "") {
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
      if ((analyzedCell.getAttribute(MINE_DATA_ATTRIBUTE) === "false") && (analyzedCell.innerHTML === "")) {
        levelComplete = false;
      }
    });

    if (levelComplete) {
      this.stopGame();
      this.showMessage("You Win!");
    }
  }

  browseAllCells(fn) {
    for (let rowIndex = 0; rowIndex < this.gameGrid.rows.length; rowIndex++) {
      for (let colIndex = 0; colIndex < this.gameGrid.rows[rowIndex].cells.length; colIndex++) {
        fn(rowIndex, colIndex);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  browseAdjacentCells(cell, fn) {
    const cellRowPosition = cell.parentNode.rowIndex;
    const cellColPosition = cell.cellIndex;

    const maxRowPosition = this.gameGridRowsNumber - 1;
    const maxColPosition = this.gameGridColsNumber - 1;

    const startRowIndex = Math.max(cellRowPosition - 1, 0);
    const endRowIndex = Math.min(cellRowPosition + 1, maxRowPosition);

    for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex++) {
      const startCellIndex = Math.max(cellColPosition - 1, 0);
      const endCellIndex = Math.min(cellColPosition + 1, maxColPosition);
      for (let colIndex = startCellIndex; colIndex <= endCellIndex; colIndex++) {
        fn(rowIndex, colIndex);
      }
    }
  }

  // --------------------------------------------------------
  // Countdown
  // --------------------------------------------------------

  handleStartCountdown() {
    if (!this.playTimer) {
      this.startCountdown();
    }
  }

  startCountdown() {
    const self = this;

    this.timeStart = new Date();
    this.playTimer = setInterval(() => {
      const timeNow = new Date();
      const timeInterval = new Date(timeNow - self.timeStart);
      self.countdownValue = TIMER_INITIAL_VALUE - timeInterval.getSeconds();

      self.refreshTimerInfo();
      self.handleEndOfCountdown();
    }, 1000);
  }

  handleEndOfCountdown() {
    if (this.countdownValue <= 0) {
      this.stopGame();
      this.showMessage("Game Over");
    }
  }

  stopCountdown() {
    clearInterval(this.playTimer);
  }

  // --------------------------------------------------------
  // utilities
  // --------------------------------------------------------

  // eslint-disable-next-line class-methods-use-this
  showMessage(message) {
    setTimeout(() => {
      alert(message); // eslint-disable-line no-alert
    }, 100);
  }

  // eslint-disable-next-line class-methods-use-this
  isString(data) {
    return typeof data === "string" || data instanceof String;
  }

  // eslint-disable-next-line class-methods-use-this
  domElement(classOrId) {
    const char = classOrId.charAt(0);
    if (char !== "." && char !== "#") {
      classOrId = `#${classOrId}`; // eslint-disable-line no-param-reassign
    }
    return document.querySelector(classOrId);
  }

  iterateOnDomElements(classOrIds, fn) {
    if (this.isString(classOrIds)) {
      classOrIds = [classOrIds]; // eslint-disable-line no-param-reassign
    }

    const self = this;
    classOrIds.forEach((id) => {
      fn(self.domElement(id));
    });
  }

  hide(classOrIds) {
    this.iterateOnDomElements(classOrIds, (e) => {
      e.style.display = "none";
    });
  }

  show(classOrIds) {
    this.iterateOnDomElements(classOrIds, (e) => {
      e.style.display = "block";
    });
  }

  populateSelect(classOrIdTarget, values) {
    if (!classOrIdTarget) {
      return;
    }
    if (!Array.isArray(values) || values.length === 0) {
      return;
    }

    const select = this.domElement(classOrIdTarget);
    values.forEach((key) => {
      const option = document.createElement("option");
      option.value = key;
      option.innerHTML = key;
      select.appendChild(option);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  formatOnTwoDigits(value) {
    return String(`0${value}`).slice(-2);
  }
}
