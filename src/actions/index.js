
import gameConstants from '../gameConstants.js';

export const SPAWN_TETROMINO = 'SPAWN_TETROMINO';
export const ROTATE_TETROMINO = 'ROTATE_TETROMINO';
export const START_GAME = 'START_GAME';
export const STOP_GAME = 'STOP_GAME';
export const CLEAR_LINE = 'CLEAR_LINE';
export const ADD_SCORE = 'ADD_SCORE';
export const MOVE_TETROMINO = 'MOVE_TETROMINO';
export const MOVE_RIGHT = 'MOVE_RIGHT';
export const MOVE_LEFT = 'MOVE_LEFT';
export const MOVE_DOWN = 'MOVE_DOWN';
export const ADD_TETROMINO = 'ADD_TETROMINO';

function getActualCoordinates(newTetromino) {
	const coordinates = [];
	const { shape, offsetX, offsetY } = newTetromino;
	const { blockUnit } = gameConstants;
	for (let i = 0; i < shape.length; i++) {
		for (let j = 0; j < shape[i].length; j++) {
			if (shape[i][j]) {
				coordinates.push({ x: j + (offsetX / blockUnit), y: i + (offsetY / blockUnit) });
			}
		}
	}
	return coordinates;
}

function rotateArray(matrix) {
	const n = matrix.length;
	const ret = [[], [], [], []];
	let closestX = 10;

	for (let i = 0; i < n; ++i) {
		for (let j = 0; j < n; ++j) {
			ret[i][j] = matrix[n - j - 1][i];
			if (ret[i][j]) {
				closestX = Math.min(closestX, j);
			}
		}
	}
	const fill = new Array(closestX).fill(0);
	for (let i = 0; i < n; ++i) {
		ret[i] = ret[i].slice(closestX).concat(fill);
	}
	return ret;
}

function checkCollisions(direction, activeTetrominos, currentTetromino) {
	const { blockUnit, fieldHeight } = gameConstants;
	const currentX = currentTetromino.offsetX / blockUnit;
	const currentY = currentTetromino.offsetY / blockUnit;
	let leftCollision = false;
	let rightCollision = false;
	let downCollision = false;

	for (let i = 0; i < currentTetromino.shape.length; i++) {
		for (let j = 0; j < currentTetromino.shape[i].length; j++) {
			const coord = currentTetromino.shape[i][j];
			if (coord) {
				if (((j - 1) + currentX) < 0) {
					leftCollision = true;
				}
				if (((j + 1) + currentX) >= 10) {
					rightCollision = true;
				}
				if (((i + 1) + currentY) >= 22) {
					downCollision = true;
				}
			}
		}
	}
	switch (direction) {
	case 'left':
		return leftCollision;
	case 'right':
		return rightCollision;
	case 'down':
		return downCollision;
	case 'rotation':
		return false;
	default:
		return true;
	}
}

export const spawnTetromino = (tetrominoType, offsetX, offsetY) => ({
	type: SPAWN_TETROMINO,
	tetrominoType,
	offsetX,
	offsetY,
});

export const addTetromino = (currentTetromino, nextTetromino) => {
	const { shapesMapping } = gameConstants;
	const newRandomNumber = Math.floor(Math.random() * 7);
	const nextRandomShape = shapesMapping[newRandomNumber];

	return {
		type: ADD_TETROMINO,
		currentTetromino: getActualCoordinates(currentTetromino),
		color: currentTetromino.color,
		nextTetromino,
		nextRandomShape,
	};
};
export const startGame = () => {
	const { shapesMapping } = gameConstants;
	const currentRandomNumber = Math.floor(Math.random() * 7);
	const nextRandomNumber = Math.floor(Math.random() * 7);
	const currentRandomShape = shapesMapping[currentRandomNumber];
	const nextRandomShape = shapesMapping[nextRandomNumber];

	return {
		type: START_GAME,
		currentRandomShape,
		nextRandomShape,
	};
};
export const stopGame = () => ({
	type: STOP_GAME,
});
export const clearLine = (position) => ({
	type: CLEAR_LINE,
	position,
});
export const addScore = (points) => ({
	type: ADD_SCORE,
	points,
});
export const moveRight = () => ({
	type: MOVE_RIGHT,
});
export const moveLeft = () => ({
	type: MOVE_LEFT,
});
export const moveDown = () => ({
	type: MOVE_DOWN,
});
export const rotateRight = (tetromino) => ({
	type: ROTATE_TETROMINO,
	rotatedTetromino: rotateArray(tetromino),
});
export const rotateTetromino = () => (
	function (dispatch, getState) {
		const { activeTetrominos, currentTetromino } = getState();
		if (!checkCollisions('rotation', activeTetrominos, currentTetromino)) {
			dispatch(rotateRight(currentTetromino.shape));
		}
	}
);
export const moveTetromino = (direction) => (
	function (dispatch, getState) {
		const { activeTetrominos, currentTetromino, nextTetromino } = getState();
		switch (direction) {
		case 'left':
			if (!checkCollisions(direction, activeTetrominos, currentTetromino)) {
				dispatch(moveLeft());
			}
			return;
		case 'right':
			if (!checkCollisions(direction, activeTetrominos, currentTetromino)) {
				dispatch(moveRight());
			}
			return;
		case 'down':
			if (!checkCollisions(direction, activeTetrominos, currentTetromino)) {
				dispatch(moveDown());
			} else {
				dispatch(addTetromino(currentTetromino, nextTetromino));
			}
			return;
		default:
			return;
		}
	}
);
export const loadGame = () => (
	function (dispatch) {
		dispatch(startGame());
		function handleMoving(e) {
			switch (e.keyCode) {
			case 37:
				e.preventDefault();
				dispatch(moveTetromino('left'));
				break;
			case 39:
				e.preventDefault();
				dispatch(moveTetromino('right'));
				break;
			case 40:15
				e.preventDefault();
				dispatch(moveTetromino('down'));
				break;
			default:
				break;
			}
		}
		function handleRotation(e) {
			switch (e.keyCode) {
			case 38:
				e.preventDefault();
				dispatch(rotateTetromino());
				break;
			default:
				break;
			}
		}
		//test request animation frame
		setInterval(() => dispatch(moveTetromino('down')), 500);
		window.addEventListener('keydown', handleMoving);
		window.addEventListener('keydown', handleRotation);
	}
);


