import { SoundName, StateName, TilePattern } from '../enums.js';
import { context, input, sounds, stateMachine, timer } from '../globals.js';
import { roundedRectangle } from '../../lib/Drawing.js';
import State from '../../lib/State.js';
import Board from '../objects/Board.js';
import Tile from '../objects/Tile.js';
import Cursor from '../objects/Cursor.js';
import Input from '../../lib/Input.js';

export default class PlayState extends State {
	constructor() {
		super();

		// Position in the grid which we're currently highlighting.
		this.cursor = new Cursor(0, 0);

		// Tile we're currently highlighting (preparing to swap).
		this.selectedTile = null;

		this.level = 1;

		// Increases as the player makes matches.
		this.score = 0;

		// Score we have to reach to get to the next level.
		this.scoreGoal = 250;

		// How much score will be incremented by per match tile.
		this.baseScore = 5;

		// How much scoreGoal will be scaled by per level.
		this.scoreGoalScale = 1.25;

		/**
		 * The timer will countdown and the player must try and
		 * reach the scoreGoal before time runs out. The timer
		 * is reset when entering a new level.
		 */
		this.maxTimer = 60;
		this.timer = this.maxTimer;

		this.remainingHints = 3;
		this.hintTiles = null;

	}

	enter(parameters) {
		this.board = parameters.board;
		this.score = parameters.score;
		this.level = parameters.level;

		// this updates the board to show the patterns
		this.board.level = this.level;
		this.board.initializePlayBoard();

		// resets hints for next level
		this.remainingHints = 3;
		this.hintTiles = null;

		this.scene = parameters.scene;
		this.timer = this.maxTimer;
		this.scoreGoal *= Math.floor(this.level * this.scoreGoalScale);
		this.cursor = new Cursor(this.board.x, this.board.y);

		this.startTimer();
	}

	exit() {
		timer.clear();
		sounds.pause(SoundName.Music3);
	}

	update(dt) {
		this.scene.update(dt);
		this.checkGameOver();
		this.checkVictory();
		this.cursor.update(dt);
	
		// If we've pressed enter, select or deselect the currently highlighted tile.
		if (input.isKeyPressed(Input.KEYS.ENTER) && !this.board.isSwapping) {
			this.selectTile();
		}

		// Press H for a hint
    	if (input.isKeyPressed(Input.KEYS.H) && this.remainingHints > 0) {
        	this.findHint();
    	}

		timer.update(dt);
	}

	render() {
		this.scene.render();
		this.board.render();

		if (this.selectedTile) {
			this.renderSelectedTile();
		}

		this.cursor.render();
		this.renderUserInterface();

		if (this.hintTiles && this.hintTiles.length === 2) {
    		context.save();
    		context.strokeStyle = 'white';
    		context.lineWidth = 3;
    		this.hintTiles.forEach((tile) => {
        		context.strokeRect(
            		tile.x + this.board.x,
            		tile.y + this.board.y,
            		Tile.SIZE,
            		Tile.SIZE
        		);
    		});
    		context.restore();
		}
	}

	selectTile() {
		const highlightedTile =
			this.board.tiles[this.cursor.boardY][this.cursor.boardX];

		/**
		 * The `?.` syntax is called "optional chaining" which allows you to check
		 * a property on an object even if that object is `null` at the time.
		 *
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
		 */
		const tileDistance =
			Math.abs(this.selectedTile?.boardX - highlightedTile.boardX) +
			Math.abs(this.selectedTile?.boardY - highlightedTile.boardY);

		// If nothing is selected, select current tile.
		if (!this.selectedTile) {
			this.selectedTile = highlightedTile;
		}

		// Remove highlight if already selected.
		else if (this.selectedTile === highlightedTile) {
			this.selectedTile = null;
		} else if (tileDistance > 1) {

			sounds.play(SoundName.Error);
			this.selectedTile = null;
		}
		// Otherwise, do the swap, and check for matches.
		else {
			this.swapTiles(highlightedTile);
		}
	}

	async swapTiles(highlightedTile) {

		if(this.checkSwap(this.selectedTile, highlightedTile)){
			await this.board.swapTiles(this.selectedTile, highlightedTile);
			this.selectedTile = null;

			this.hintTiles = null;
			
			await this.calculateMatches();
		}
		else{

			// invalid swap, animate froward and back
			await this.board.swapTiles(this.selectedTile, highlightedTile);
			// invalid sound 
			sounds.play(SoundName.Error)
			// swaps back
			await this.board.swapTiles(this.selectedTile, highlightedTile);

			this.selectedTile = null;
		}		
	}

	checkSwap(tileA, tileB){
		//original board state
		const ax = tileA.boardX;
		const bx = tileB.boardX;
		const ay = tileA.boardY;
		const by = tileB.boardY;
		
		// swaps in memory
		const temp = this.board.tiles[ay][ax];
		this.board.tiles[ay][ax] = this.board.tiles[by][bx];
  		this.board.tiles[by][bx] = temp;

		// updates tile coordinates temporarily
		this.board.tiles[ay][ax].boardX = ax;
  		this.board.tiles[ay][ax].boardY = ay;
  		this.board.tiles[by][bx].boardX = bx;
  		this.board.tiles[by][bx].boardY = by;

		// checks match detection	
		this.board.calculateMatches();
  		const hasMatch = this.board.matches.length > 0;

		//revert swap
		const temp2 = this.board.tiles[ay][ax];
  		this.board.tiles[ay][ax] = this.board.tiles[by][bx];
  		this.board.tiles[by][bx] = temp2;

  		this.board.tiles[ay][ax].boardX = ax;
  		this.board.tiles[ay][ax].boardY = ay;
  		this.board.tiles[by][bx].boardX = bx;
  		this.board.tiles[by][bx].boardY = by;

		//clears matches 
		this.board.matches = [];

  		return hasMatch;
	}

	renderSelectedTile() {
		context.save();
		context.fillStyle = 'rgb(255, 255, 255, 0.5)';
		roundedRectangle(
			context,
			this.selectedTile.x + this.board.x,
			this.selectedTile.y + this.board.y,
			Tile.SIZE,
			Tile.SIZE,
			10,
			true,
			false
		);
		context.restore();
	}

	renderUserInterface() {
		context.fillStyle = 'rgb(56, 56, 56, 0.9)';
		roundedRectangle(
			context,
			50,
			this.board.y,
			225,
			Board.SIZE * Tile.SIZE + 45, // added to make hints fit in black box
			5,
			true,
			false
		);

		context.fillStyle = 'white';
		context.font = '25px Joystix';
		context.textAlign = 'left';
		context.fillText(`Level:`, 70, this.board.y + 45);
		context.fillText(`Score:`, 70, this.board.y + 105);
		context.fillText(`Goal:`, 70, this.board.y + 165);
		context.fillText(`Timer:`, 70, this.board.y + 225);
		context.fillText(`Hints:`, 70, this.board.y + 285);

		context.textAlign = 'right';
		context.fillText(`${this.level}`, 250, this.board.y + 45);
		context.fillText(`${this.score}`, 250, this.board.y + 105);
		context.fillText(`${this.scoreGoal}`, 250, this.board.y + 165);
		context.fillText(`${this.timer}`, 250, this.board.y + 225);
		context.fillText(`${this.remainingHints}`, 250, this.board.y + 285);

	}

	/**
	 * Calculates whether any matches were found on the board and tweens the needed
	 * tiles to their new destinations if so. Also removes tiles from the board that
	 * have matched and replaces them with new randomized tiles, deferring most of this
	 * to the Board class.
	 */
	async calculateMatches() {
		// Get all matches for the current board.
		this.board.calculateMatches();

		// If no matches, then no need to proceed with the function.
		if (this.board.matches.length === 0) {
			return;
		}

		this.calculateScore();

		// Remove any matches from the board to create empty spaces.
		this.board.removeMatches();

		await this.placeNewTiles();

		/**
		 * Recursively call function in case new matches have been created
		 * as a result of falling blocks once new blocks have finished falling.
		 */
		await this.calculateMatches();
	}

	calculateScore() {
		let totalTilesMatched = 0;

    	this.board.matches.forEach((match) => {
        	match.forEach(tile => {
            	let tilePoints = 5; // default flat tile
            	if (tile.pattern === TilePattern.Star) tilePoints = 30;
            	this.score += tilePoints;
            	totalTilesMatched += 1;
        	});
    	});

    const secondsPerTile = 2;
    const timeToAdd = totalTilesMatched * secondsPerTile;

    // Add to timer
    this.timer = Math.min(this.timer + timeToAdd, this.maxTimer);


	}



	async placeNewTiles() {
		// Get an array with tween values for tiles that should now fall as a result of the removal.
		const tilesToFall = this.board.getFallingTiles();

		// Tween all the falling blocks simultaneously.
		await Promise.all(
			tilesToFall.map((tile) => {
				timer.tweenAsync(tile.tile, tile.endValues, 0.25);
			})
		);

		// Get an array with tween values for tiles that should replace the removed tiles.
		const newTiles = this.board.getNewTiles();

		// Tween the new tiles falling one by one for a more interesting animation.
		for (const tile of newTiles) {
			await timer.tweenAsync(tile.tile, tile.endValues, 0.1);
		}
	}

	startTimer() {
		// Decrement the timer every second.
		timer.addTask(() => {
			this.timer--;

			if (this.timer <= 5) {
				sounds.play(SoundName.Clock);
			}
		}, 1);
	}

	checkVictory() {
		if (this.score < this.scoreGoal) {
			return;
		}

		sounds.play(SoundName.NextLevel);

		stateMachine.change(StateName.LevelTransition, {
			level: this.level + 1,
			score: this.scoreGoal,
			scene: this.scene,
		});
	}

	checkGameOver() {
		if (this.timer > 0) {
			return;
		}

		sounds.play(SoundName.GameOver);

		stateMachine.change(StateName.GameOver, {
			score: this.score,
			scene: this.scene,
		});
	}

	findHint() {
    	// clear previous hint
    	this.hintTiles = null;

    	const rows = this.board.tiles.length;
    	const cols = this.board.tiles[0].length;

    	for (let y = 0; y < rows; y++) {
        	for (let x = 0; x < cols; x++) {
            	const tileA = this.board.tiles[y][x];
            	if (!tileA) continue;

            	// only check right and down to avoid duplicates
            	const neighbors = [
                	{nx: x + 1, ny: y},
                	{nx: x,     ny: y + 1},
            	];

            	for (const {nx, ny} of neighbors) {
                	if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                	const tileB = this.board.tiles[ny][nx];
                	if (!tileB) continue;

                	// temporary swap in array (do not change boardX/boardY)
                	this.board.tiles[y][x] = tileB;
                	this.board.tiles[ny][nx] = tileA;

                	// let Board.calculateMatches check the swapped board
                	this.board.calculateMatches();
                	const found = this.board.matches.length > 0;

                	// revert swap and clear matches
                	this.board.tiles[y][x] = tileA;
                	this.board.tiles[ny][nx] = tileB;
                	this.board.matches = [];

                	if (found) {
                    	this.hintTiles = [tileA, tileB];
                    	this.remainingHints = Math.max(0, this.remainingHints - 1);
                    	return;
                	}
            	}
        	}
    	}

    	// no hint found
    	this.hintTiles = null;
	}


	checkSwapForMatch(tileA, tileB) {
    	// Swap temporarily
    	const tempColour = tileA.colour;
    	const tempPattern = tileA.pattern;

    	tileA.colour = tileB.colour;
    	tileA.pattern = tileB.pattern;
    	tileB.colour = tempColour;
    	tileB.pattern = tempPattern;

    	const matches = this.board.findMatches(); // existing match-finding method

    	// Revert
    	tileB.colour = tileA.colour;
    	tileB.pattern = tileA.pattern;
    	tileA.colour = tempColour;
    	tileA.pattern = tempPattern;

    	return matches.length > 0;
	}


}
