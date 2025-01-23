// r1 can cook

class ASCIITerminalRenderer {
  #colors = {
      red: "\x1b[31m",
      green: "\x1b[32m",
      blue: "\x1b[34m",
      reset: "\x1b[0m"
  };

  #cellWidth = 8;  // Adjusted for better spacing

  render(state) {
      if (!state.grid.length || !state.grid[0].length) {
          return "Empty grid";
      }

      const rowCount = state.grid.length;
      const colCount = state.grid[0].length;
      let output = '';
      
      // Create horizontal border line
      const horizontalBorder = Array(colCount)
          .fill(0)
          .map(() => "+" + "-".repeat(this.#cellWidth))
          .join("") + "+";

      for (let y = 0; y < rowCount; y++) {
          output += horizontalBorder + "\n";
          output += this.#renderRow(state, y) + "\n";
      }
      output += horizontalBorder;

      return output;
  }

  #renderRow(state, y) {
      return state.grid[y]
          .map(cell => "|" + this.#renderCell(cell).padEnd(this.#cellWidth))
          .join("") + "|";
  }

  #renderCell(cell) {
      return cell
          .map((value, index) => {
              const paddedValue = value.toString().padStart(2, " ");
              return this.#colorize(paddedValue, index);
          })
          .join(" ");
  }

  #colorize(text, resourceIndex) {
      const color = Object.values(this.#colors)[resourceIndex];
      return `${color}${text}${this.#colors.reset}`;
  }
}

// Example usage with [y][x] access:
const gameState = {
  grid: [
      // Row 0 (y=0)
      [
          [5, 2, 3],  // x=0
          [1, 4, 5],  // x=1
          [6, 2, 1]   // x=2
      ],
      // Row 1 (y=1)
      [
          [0, 1, 4],  // x=0
          [2, 3, 1],  // x=1
          [3, 3, 3]   // x=2
      ],
      // Row 2 (y=2)
      [
          [7, 0, 2],  // x=0
          [0, 5, 0],  // x=1
          [4, 1, 2]   // x=2
      ]
  ]
};

const renderer = new ASCIITerminalRenderer();
console.log(renderer.render(gameState));