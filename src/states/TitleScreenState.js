import Board from '../objects/Board.js';
import { SoundName, StateName } from '../enums.js';
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	input,
	sounds,
	stateMachine,
	timer,
} from '../globals.js';
import Scene from '../objects/Scene.js';
import State from '../../lib/State.js';
import { roundedRectangle } from '../../lib/Drawing.js';
import Input from '../../lib/Input.js';

/**
 * Represents the state the game is in when we've just started.
 * Displays "Match-3" in large text, as well as a menu to "Start" or "Quit".
 */
export default class TitleScreenState extends State {
	constructor() {
		super();

		this.menuOptions = ['Start', 'Quit'];

		// Currently selected menu item.
		this.currentMenuOption = 0;

		// Colours we'll use to change the title text.
		this.colours = [
			[217, 87, 99],
			[95, 205, 228],
			[251, 242, 54],
			[118, 66, 138],
			[153, 229, 80],
			[223, 113, 38],
		];

		this.titleLetters = ['M', 'A', 'T', 'C', 'H', '3'];

		// Time for a colour change if it's been half a second.
		this.startColourTimer();

		// Generate full board just for display in the background.
		this.board = new Board(
			Board.POSITION_CENTER.x,
			Board.POSITION_CENTER.y,
			Board.POSITION_CENTER.width,
			Board.POSITION_CENTER.height
		);
		this.board.initializeTitleScreenBoard();

		// Randomly swap tiles for an interesting background animation.
		this.board.autoSwap();

		// Used to animate the full-screen transition rectangle.
		this.transitionAlpha = 0;

		// If we've selected an option, we need to pause input while we animate out.
		this.inTransition = false;

		this.scene = new Scene();

		// Start the music the very first time showing this state.
		sounds.play(SoundName.Music);
	}

	enter(parameters) {
		this.transitionAlpha = 0;
		this.inTransition = false;

		this.board.initializeTitleScreenBoard();
		this.board.autoSwap();
		sounds.play(SoundName.Music);
		this.startColourTimer();
	}

	exit() {
		sounds.pause(SoundName.Music);
	}

	update(dt) {
		this.scene.update(dt);

		// Update the timer, which will be used for the fade transitions.
		timer.update(dt);

		// If we're in a transition, don't process any input.
		if (this.inTransition) {
			return;
		}

		if (
			input.isKeyPressed(Input.KEYS.W) ||
			input.isKeyPressed(Input.KEYS.S)
		) {
			this.currentMenuOption = this.currentMenuOption === 0 ? 1 : 0;
			sounds.play(SoundName.Select);
		}

		// switch to another state via one of the menu options
		if (input.isKeyPressed(Input.KEYS.ENTER)) {
			this.startTransition();
		}
	}

	render() {
		this.scene.render();
		this.board.render();

		this.drawDarkBackground();
		this.drawTitleText();
		this.drawMenu();
		this.drawTransitionOverlay();
	}

	async startTransition() {
		if (this.currentMenuOption === 0) {
			/**
			 * Tween (using the Timer) the transition rectangle's alpha to 1, then
			 * transition to the LevelTransitionState after the animation is over.
			 */
			await timer.tweenAsync(this, { transitionAlpha: 1 }, 1);

			stateMachine.change(StateName.LevelTransition, {
				level: 1,
				scene: this.scene,
			});

			delete this.colourTimer;
		} else {
			close();
		}

		// Disable input during transition.
		this.inTransition = true;
	}

	/**
	 * Keep the background and tiles a little darker to emphasize foreground.
	 */
	drawDarkBackground() {
		context.fillStyle = 'rgb(0, 0, 0, 0.5)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	/**
	 * Draw the transition overlay rectangle. It is normally fully transparent,
	 * unless we're moving to a new state, in which case it slowly becomes opaque.
	 */
	drawTransitionOverlay() {
		context.fillStyle = `rgb(255, 255, 255, ${this.transitionAlpha})`;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	/**
	 * Draw the centered MATCH-3 text with background rectangle,
	 * placed along the Y axis relative to the center.
	 */
	drawTitleText() {
		const offSet = -95;

		// Draw a semi-transparent rectangle behind the title.
		context.fillStyle = 'rgb(255, 255, 255, 0.5)';
		roundedRectangle(
			context,
			CANVAS_WIDTH / 2 - 175,
			CANVAS_HEIGHT / 2 + offSet,
			350,
			100,
			5,
			true,
			false
		);

		context.font = '50px Joystix';
		context.textBaseline = 'middle';
		context.textAlign = 'center';

		// Print MATCH 3 letters in their current colors based on the timer.
		for (let i = 0; i < this.titleLetters.length; i++) {
			// Shadow.
			context.fillStyle = `rgb(34, 32, 52, 1)`;
			context.fillText(
				this.titleLetters[i][0],
				CANVAS_WIDTH / 2 + 50 * i - 125,
				CANVAS_HEIGHT / 2 + offSet + 60
			);

			// Coloured Text.
			const r = this.colours[i][0];
			const g = this.colours[i][1];
			const b = this.colours[i][2];

			context.fillStyle = `rgb(${r}, ${g}, ${b})`;
			context.fillText(
				this.titleLetters[i][0],
				CANVAS_WIDTH / 2 + 50 * i - 130,
				CANVAS_HEIGHT / 2 + offSet + 55
			);
		}
	}

	/**
	 * Draws "Start" and "Quit Game" text over semi-transparent rectangles.
	 */
	drawMenu() {
		const offSet = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 + 75 };
		const menuWidth = 150;
		const menuHeight = 80;

		// Draw rectangle behind menu options.
		context.fillStyle = 'rgb(255, 255, 255, 0.5)';
		roundedRectangle(
			context,
			offSet.x - menuWidth / 2,
			offSet.y - menuHeight / 2,
			menuWidth,
			menuHeight,
			5,
			true,
			false
		);

		this.menuOptions.forEach((menuOption, index) => {
			this.drawMenuOption(
				menuOption,
				offSet.x,
				offSet.y + 30 * index - 14,
				index
			);
		});
	}

	drawMenuOption(text, x, y, index) {
		context.save();
		context.font = '20px Joystix';
		this.drawTextShadow(text, x, y);

		if (this.currentMenuOption === index) {
			context.fillStyle = 'rgb(99, 155, 255)';
		} else {
			context.fillStyle = 'rgb(48, 96, 130)';
		}

		context.fillText(text, x, y);
		context.restore();
	}

	/**
	 * Helper function for drawing just text backgrounds; draws several layers
	 * of the same text over top of one another for a thicker shadow.
	 */
	drawTextShadow(text, x, y) {
		context.save();
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillStyle = 'rgb(34, 32, 52, 1)';
		context.fillText(text, x + 2, y + 1);
		context.fillText(text, x + 1, y + 1);
		context.fillText(text, x + 0, y + 1);
		context.fillText(text, x + 1, y + 2);
		context.restore();
	}

	startColourTimer() {
		this.colourTimer = timer.addTask(() => {
			// Shift every colour to the next, looping the last to the front.
			this.colours = this.colours
				.slice(1)
				.concat(this.colours.slice(0, 1));
		}, 0.25);
	}
}
