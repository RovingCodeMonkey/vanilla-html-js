document.addEventListener('DOMContentLoaded', () => {
    ticTacToe.generateBoard();    
});


const ticTacToe = {
  currentPlayer: 'X',
  boardSize: 3,
  clickedCells: 0,
  board: [],
  generateBoard() {
    this.reset();
    const contentSection = document.getElementById('content');  
    document.getElementById('resetButton').addEventListener('click', () => this.reset());
    let row = null;
    for (let i = 0; i < this.boardSize*this.boardSize; i++) {    
        let rowIndex = Math.floor(i / this.boardSize);
        let colIndex = i % this.boardSize;
        if (i % this.boardSize === 0) {
        row = document.createElement('div');
        contentSection.appendChild(row);    
        row.classList.add('row');
        }
        const cell = document.createElement('div');        
        cell.textContent = ' ';
        row.appendChild(cell);
        if (!this.board[rowIndex]) {
            this.board[rowIndex] = [];
        }
        this.board[rowIndex][colIndex] = cell;
        cell.addEventListener('click', (e) => {
            this.clicked(rowIndex, colIndex);                      
        });
    }
  },
  reset() {
    document.querySelectorAll('#content .row div').forEach(row => row.textContent = ' ');
    this.clickedCells = 0;
  },
  clicked(row, col) {
    if (this.board[row][col].textContent === ' ') {
      this.board[row][col].textContent = this.currentPlayer;      
      this.clickedCells++;  
      this.verifyWin(row, col);  
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }
  },
  verifyWin(row, col) {
    let won = this.checkColumn(row, col) || this.checkrow(row, col) || this.checkdiagonalLeft(row, col) || this.checkdiagonalRight(row, col);
    if (won) {
      alert(`Player ${this.currentPlayer} wins!`);
      this.reset();
    }
    else if (this.clickedCells === this.boardSize * this.boardSize) {
      alert('It\'s a draw!');
      this.reset();
    }
  },    
  checkColumn(row, col) {
    let ci = col;
    while (ci >= 0) {
      if (this.board[row][ci].textContent !== this.board[row][col].textContent) {
        return false;
      }
      ci--;
    }
     ci = col;
    while (ci < this.boardSize) {
      if (this.board[row][ci].textContent !== this.board[row][col].textContent) {
        return false;
      }
      ci++;
    }
    return true;
  },

  checkrow(row, col) {
    let ri = row;
    while (ri >= 0) {
      if (this.board[ri][col].textContent !== this.board[row][col].textContent) {
        return false;
      }
      ri--;
    }
     ri = row;
    while (ri < this.boardSize) {
      if (this.board[ri][col].textContent !== this.board[row][col].textContent) {
        return false;
      }
      ri++;
    }
    return true;
  },
  checkdiagonalLeft(row, col) {
    if (row !== col) {
      return false;
    }
    let ri = row;
    let ci = col;
    while (ri >= 0 && ci >= 0) {
      if (this.board[ri][ci].textContent !== this.board[row][col].textContent) {
        return false;
      }
      ri--;
      ci--;
    }
    ri = row;
    ci = col;
    while (ri < this.boardSize && ci < this.boardSize) {
      if (this.board[ri][ci].textContent !== this.board[row][col].textContent) {
        return false;
      }
      ri++;
      ci++;
    }
    return true;
  },
   checkdiagonalRight(row, col) {
    if (row + col !== this.boardSize - 1) {
      return false;
    }
    let ri = row;
    let ci = col;
    while (ri < this.boardSize && ci >= 0) {
      if (this.board[ri][ci].textContent !== this.board[row][col].textContent) {
        return false;
      }
      ri++;
      ci--;
    }
    ri = row;
    ci = col;
    while (ri < this.boardSize && ci >= 0) {
      if (this.board[ri][ci].textContent !== this.board[row][col].textContent) {
        return false;
      }
      ri++;
      ci--;
    }
    return true;
  }

};
  