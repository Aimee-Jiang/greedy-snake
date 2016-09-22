
var BODY = 1, FOOD = 2;
var KEYS = {left: 37, up: 38, right: 39, down: 40};
var DIRS = {37: true, 38: true, 39: true, 40: true};

var SnakeGame = React.createClass({displayName: 'SnakeGame',
  getInitialState: function() {
    var start = this.props.startIndex || 21;
    // snake: record the snake body
    // board: O(1) time to decide whether it's body, food or empty
    var snake = [start], board = []; board[start] = BODY;
    return {
      snake: snake,
      board: board,
      //growth: 0,
      paused: true,
      gameOver: false,
      direction: KEYS.down,
      tick: 500
    }
  },

  componentDidMount: function() {
    this._resume();
  },

  _reset: React.autoBind(function() {
    this.setState(this.getInitialState());
    this._resume();
  }),

  _pause: React.autoBind(function() {
    if (this.state.gameOver || this.state.paused) { return; }
    this.setState({paused: true});
  }),

  _resume: React.autoBind(function() {
    if (this.state.gameOver || !this.state.paused) { return; }
    this.setState({paused: false});
    this.refs.board.getDOMNode().focus();
    this._tick();
  }),

  _tick: React.autoBind(function() {
    if (this.state.paused) { return; }
    var snake = this.state.snake;
    var board = this.state.board;
    //var growth = this.state.growth;
    var direction = this.state.direction;
    var tick = this.state.tick;

    var numRows = this.props.numRows || 20;
    var numCols = this.props.numCols || 20;
    var ret = getNextIndex(snake[0], direction, numRows, numCols);
    var y = ret[0], x = ret[1], head = y * numCols + x
    if (y < 0 || y >= numRows || x < 0 || x >= numCols) {
      this.setState({gameOver: true});
      return;
    }
    if (snake.indexOf(head) != -1) {
      this.setState({gameOver: true});
      return;
    }

    var needsFood = board[head] == FOOD || snake.length == 1;
    if (needsFood) {
      var ii, numCells = numRows * numCols;
      do { ii = Math.floor(Math.random() * numCells); } while (board[ii]);
      board[ii] = FOOD;
      if (tick > 100) tick -= 20;
    } else {
      board[snake.pop()] = null;
    }

    snake.unshift(head);
    board[head] = BODY;

    if (this._nextDirection) {
      direction = this._nextDirection;
      this._nextDirection = null;
    }

    this.setState({
      snake: snake,
      board: board,
     // growth: growth,
      direction: direction
    });

    setTimeout(this._tick, this.state.tick);
  }),

  _handleKey: React.autoBind(function(event) {
    var direction = event.nativeEvent.keyCode;
    var difference = Math.abs(this.state.direction - direction);
    // if key is invalid, or the same, or in the opposite direction, ignore it
    if (DIRS[direction] && difference !== 0 && difference !== 2) {
      this._nextDirection = direction;
    }
  }),

  render: function() {
    var cells = [];
    var numRows = this.props.numRows || 20;
    var numCols = this.props.numCols || 20;
    var cellSize = this.props.cellSize || 30;

    for (var row = 0; row < numRows; row++) {
      for (var col = 0; col < numCols; col++) {
        var code = this.state.board[numCols * row + col];
        var type = code == BODY ? 'body' : code == FOOD ? 'food' : 'null';
        cells.push(React.DOM.div( {className:type + '-cell'}, null ));
      }
    }

    return (
      React.DOM.div( {className:"snake-game"}, [
        React.DOM.h1( {className:"snake-score"}, ["Length: ", this.state.snake.length]),
        React.DOM.div(
          {ref:"board",
          className:'snake-board' + (this.state.gameOver ? ' game-over' : ''),
          tabIndex:0,
          onBlur:this._pause,
          onFocus:this._resume,
          onKeyDown:this._handleKey,
          style:{width: numCols * cellSize, height: numRows * cellSize}},
          cells
        ),
        React.DOM.div( {className:"snake-controls"}, [
          this.state.paused ? React.DOM.button( {onClick:this._resume}, "Resume") : null,
          this.state.gameOver ? React.DOM.button( {onClick:this._reset}, "Game Over.. Click to New Game") : null
        ])
      ])
    );
  }
});

function getNextIndex(head, direction, numRows, numCols) {
  var x = head % numCols;
  var y = Math.floor(head / numCols);

  switch (direction) {
    case KEYS.up:    y =  y - 1; break;
    case KEYS.down:  y =  y + 1; break;
    case KEYS.left:  x =  x - 1; break;
    case KEYS.right: x =  x + 1; break;
    default: return;
  }
  return [y, x];
}

React.renderComponent(SnakeGame(null, null ), document.body);
