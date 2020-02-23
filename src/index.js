import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button
      className={props.highlight ? 'square highlighted' : 'square'}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        highlight={this.props.winningSquares.includes(i)}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(row, arr) {
    return [...Array(arr.length)].map((x, col) => {
      return this.renderSquare(col + row * 3);
    });
  }

  renderBoard(i) {
    return [...Array(i)].map((x, row, arr) => {
      return (
        <div key={row} className='board-row'>
          {this.renderRow(row, arr)}
        </div>
      );
    });
  }

  render() {
    return <div>{this.renderBoard(3)}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          row: null,
          col: null
        }
      ],
      stepNumber: 0,
      xIsNext: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (squares[i] || calculateWinnerAndLine(squares)) {
      return;
    }
    const [row, col] = calculateCoords(i);
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([
        {
          squares: squares,
          row,
          col
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0
    });
  }

  render() {
    const { history, stepNumber } = this.state;
    const current = history[stepNumber];
    let result = calculateWinnerAndLine(current.squares);
    const { winner, line } = result ? result : {};
    let winningSquares = [];
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
      winningSquares = line;
    } else if (this.state.stepNumber === 9) {
      status = "It's a draw";
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    const moves = history.map((step, move) => {
      const { row, col } = step;
      const desc = move
        ? `Go to move #${move} (row: ${row}, col: ${col})`
        : 'Back to Start';
      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            className={move === stepNumber ? 'active' : ''}
          >
            {desc}
          </button>
        </li>
      );
    });

    return (
      <div className='game'>
        <div className='game-board'>
          <div>
            <h1>{status}</h1>
          </div>
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            winningSquares={winningSquares}
          />
        </div>
        <div className='game-info'>
          <div className='info-section'>
            <ol>{moves}</ol>
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById('root'));

// helper functions

function calculateWinnerAndLine(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    // if line with same character 'X' or 'O'
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line };
    }
  }
  return null;
}

function calculateCoords(i) {
  const row = Math.ceil((i + 1) / 3);
  const col = (i + 1) % 3 === 0 ? 3 : (i + 1) % 3;
  return [row, col];
}
