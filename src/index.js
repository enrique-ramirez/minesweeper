// NameSpace
window.minesweeper = {};

// Constructor function
function MineSweeper(width, height, mines) {
  // API
  let game = {
    mines: {},
    board: []
  };
  // Number of opened cells. Useful for displaying WIN message.
  let open = 0;

  function getRandomCoordinate() {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);

    return [x, y];
  }

  function getAdjacentMines(x, y) {
    let numberOfMines = 0;

    // Minimums are calculated as n - 1. Math.max is used to default to 0 if
    // a negative number results from the operation.
    const xMin = Math.max(0, x - 1);
    const yMin = Math.max(0, y - 1);
    // Max are calculated as n + 1. Math.min is used to default to our max
    // width/height in case the result from the operation is bigger.
    const xMax = Math.min(width - 1, x + 1);
    const yMax = Math.min(height - 1, y + 1);

    // For every X...
    for (let i = xMin; i <= xMax; i++) {
      // ... and every Y
      for (let j = yMin; j <= yMax; j++) {
        // Check if it's not the "clicked" cell...
        if (!(i === x && j === y)) {
          // ... and also make sure there is a mine in the cell
          if (game.mines[`${i},${j}`]) {
            // If there is, then sum to the result
            numberOfMines += 1;
          }
        }
      }
    }

    // Update the number of mines in this coordinate
    game.board[y][x] = numberOfMines;
    // ALso add 1 to our opened cells
    open += 1;

    // If there were no adjacent mines, open every coordinate as well and
    // check for adjacent mines there.
    if (numberOfMines === 0) {
      for (let i = xMin; i <= xMax; i++) {
        for (let j = yMin; j <= yMax; j++) {
          if (!(i === x && j === y) && game.board[j][i] === "-") {
            getAdjacentMines(i, j);
          }
        }
      }
    }
  }

  // Messy function to render our board as HTML elements. It basically iterates every row and then
  // every column of our game.board to create a grid of <divs> with either a <button> or a number.
  function renderGame() {
    document.getElementById("app").innerHTML = `
      <div class="container board">
        ${game.board
          .map(
            (row, y) =>
              `<div class="row">
              ${row
                .map(
                  (col, x) => `
                <div class="cell">
                  ${
                    col !== "-"
                      ? col
                      : `
                      <button type="button" onclick="minesweeper.instance.handleClick(${x}, ${y})">
                        ${col}
                      </button>
                      `
                  }
                </div>
              `
                )
                .join("&nbsp;")}
          </div>
        `
          )
          .join("&nbsp;")}
      </div>
    `;
  }

  function renderGameOver() {
    document.getElementById("app").innerHTML = `
      <div class="container message">
        <p>You lose!</p>
        <button type="button" onclick="minesweeper.renderForm()">Retry</button>
      </div>
    `;
  }

  function renderWin() {
    document.getElementById("app").innerHTML = `
      <div class="container message">
        <img alt="WINNER WINNER CHICKEN DINNER" src="https://media1.giphy.com/media/g9582DNuQppxC/giphy.gif" />
        <p>CONGRATULATIONS! You win!</p>
        <button type="button" onclick="minesweeper.renderForm()">Play again</button>
      </div>
    `;
  }

  // Place initial mines
  function placeMines() {
    const [x, y] = getRandomCoordinate();

    if (!game.mines[`${x},${y}`]) {
      game.mines[`${x},${y}`] = true;
    } else {
      placeMines();
    }
  }

  function init() {
    // Build initial, empty grid
    for (let i = 0; i < height; i++) {
      // This just creates an array of n length and fills it with dashes.
      let row = Array.from(Array(width).keys()).map(() => "-");
      // Push our row to our board. Our board is basically an array of rows.
      game.board.push(row);
    }

    // Place Mines
    for (let j = 0; j < mines; j++) {
      placeMines();
    }
  }

  function handleClick(x, y) {
    // If user clicked on a mine, it's game over
    if (game.mines[`${x},${y}`]) {
      return renderGameOver();
    }

    // Else, calculate adjacent mines
    getAdjacentMines(x, y);
    // ... re-render UI.
    renderGame();

    // If there's nothing left to click but mines, render win.
    if (width * height - mines === open) {
      renderWin();
    }
  }

  // Generate API interface shortcuts for click and render methods.
  game.handleClick = handleClick;
  game.renderGame = renderGame;

  // Initialize
  init();

  return game;
}

// Generates our configuration form. Just asks for the size of grid
// and number of mines.
function renderForm() {
  document.getElementById("app").innerHTML = `
    <div class="container form">
      <label>
        Grid Size:
        <br />
        <div class="size">
          <input id="width" type="number" value="5" />
          <span>x</span>
          <input id="height" type="number" value="5" />
        </div>
      </label>

      <label>
        Number of mines:
        <br />
        <input id="mines" type="number" value="3" />
      </label>

      <button class="start" type="button" onclick="minesweeper.generate()">Start Game!</button>
    </div>

  `;
}

// Generates a new instance of our game.
function generate() {
  // Get values from form
  const width = parseInt(document.getElementById("width").value, 10);
  const height = parseInt(document.getElementById("height").value, 10);
  let mines = parseInt(document.getElementById("mines").value, 10);

  if (mines >= width * height) {
    return alert(`Too many mines. You're trying to allocate ${mines} mines in ${width * height} spaces! Try reducing the number of mines.`);
  }
  // create our instance
  const instance = new MineSweeper(
    width,
    height,
    mines,
  );

  // Render the game
  instance.renderGame();

  // Assign global variable for access
  window.minesweeper.instance = instance;
}

// Global variables for access to methods
window.minesweeper.generate = generate;
window.minesweeper.renderForm = renderForm;

renderForm();
