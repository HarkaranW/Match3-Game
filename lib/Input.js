/**
 * Manages keyboard and mouse input for a game or application.
 * Listens for key presses, releases, and mouse events on the provided canvas.
 */
export default class Input {
	/**
	 * A constant object mapping key names to their string representations.
	 */
	static KEYS = {
		BACKSPACE: 'Backspace',
		TAB: 'Tab',
		ENTER: 'Enter',
		SHIFT: 'Shift',
		CONTROL: 'Control',
		ALT: 'Alt',
		PAUSE: 'Pause',
		CAPS_LOCK: 'CapsLock',
		ESCAPE: 'Escape',
		SPACE: ' ',
		PAGE_UP: 'PageUp',
		PAGE_DOWN: 'PageDown',
		END: 'End',
		HOME: 'Home',
		ARROW_LEFT: 'ArrowLeft',
		ARROW_UP: 'ArrowUp',
		ARROW_RIGHT: 'ArrowRight',
		ARROW_DOWN: 'ArrowDown',
		PRINT_SCREEN: 'PrintScreen',
		INSERT: 'Insert',
		DELETE: 'Delete',
		0: '0',
		1: '1',
		2: '2',
		3: '3',
		4: '4',
		5: '5',
		6: '6',
		7: '7',
		8: '8',
		9: '9',
		A: 'A',
		B: 'B',
		C: 'C',
		D: 'D',
		E: 'E',
		F: 'F',
		G: 'G',
		H: 'H',
		I: 'I',
		J: 'J',
		K: 'K',
		L: 'L',
		M: 'M',
		N: 'N',
		O: 'O',
		P: 'P',
		Q: 'Q',
		R: 'R',
		S: 'S',
		T: 'T',
		U: 'U',
		V: 'V',
		W: 'W',
		X: 'X',
		Y: 'Y',
		Z: 'Z',
		META: 'Meta', // Windows key on Windows, Command key on macOS
		NUMPAD_0: 'Numpad0',
		NUMPAD_1: 'Numpad1',
		NUMPAD_2: 'Numpad2',
		NUMPAD_3: 'Numpad3',
		NUMPAD_4: 'Numpad4',
		NUMPAD_5: 'Numpad5',
		NUMPAD_6: 'Numpad6',
		NUMPAD_7: 'Numpad7',
		NUMPAD_8: 'Numpad8',
		NUMPAD_9: 'Numpad9',
		NUMPAD_ADD: 'NumpadAdd',
		NUMPAD_SUBTRACT: 'NumpadSubtract',
		NUMPAD_MULTIPLY: 'NumpadMultiply',
		NUMPAD_DIVIDE: 'NumpadDivide',
		NUMPAD_DECIMAL: 'NumpadDecimal',
		NUMPAD_ENTER: 'NumpadEnter',
		F1: 'F1',
		F2: 'F2',
		F3: 'F3',
		F4: 'F4',
		F5: 'F5',
		F6: 'F6',
		F7: 'F7',
		F8: 'F8',
		F9: 'F9',
		F10: 'F10',
		F11: 'F11',
		F12: 'F12',
		F13: 'F13',
		F14: 'F14',
		F15: 'F15',
		F16: 'F16',
		F17: 'F17',
		F18: 'F18',
		F19: 'F19',
		F20: 'F20',
		F21: 'F21',
		F22: 'F22',
		F23: 'F23',
		F24: 'F24',
		NUM_LOCK: 'NumLock',
		SCROLL_LOCK: 'ScrollLock',
		COMMA: ',',
		PERIOD: '.',
		SEMICOLON: ';',
		EQUALS: '=',
		MINUS: '-',
		SLASH: '/',
		BACKSLASH: '\\',
		BRACKET_LEFT: '[',
		BRACKET_RIGHT: ']',
		QUOTE: "'",
		BACKQUOTE: '`',
		BRACE_LEFT: '{',
		BRACE_RIGHT: '}',
		TILDE: '~',
	};

	/**
	 * A constant object mapping mouse buttons to their numerical values.
	 */
	static MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2 };

	/**
	 * Initializes the Input system and attaches event listeners to the provided canvas.
	 *
	 * @param {HTMLCanvasElement} canvas - The canvas element to capture input from.
	 */
	constructor(canvas) {
		this.canvas = canvas;
		this.mouse = { x: 0, y: 0 };
		this.keys = {};
		this.mouseButtons = {};

		this.initEventListeners();
	}

	/**
	 * Sets up event listeners for keyboard and mouse events.
	 * Listens for key presses, releases, mouse movements, and button presses.
	 *
	 * @private
	 * @returns {void}
	 */
	initEventListeners() {
		this.canvas.addEventListener('keydown', (event) => {
			this.keys[event.key.toUpperCase()] = true;
		});

		this.canvas.addEventListener('keyup', (event) => {
			this.keys[event.key.toUpperCase()] = false;
		});

		this.canvas.addEventListener('mousemove', (event) => {
			const canvasRectangle = this.canvas.getBoundingClientRect();

			this.mouse.x =
				((event.clientX - canvasRectangle.left) /
					(canvasRectangle.right - canvasRectangle.left)) *
				this.canvas.width;
			this.mouse.y =
				((event.clientY - canvasRectangle.top) /
					(canvasRectangle.bottom - canvasRectangle.top)) *
				this.canvas.height;
		});

		this.canvas.addEventListener('mousedown', (event) => {
			this.mouseButtons[event.button] = true;
		});

		this.canvas.addEventListener('mouseup', (event) => {
			this.mouseButtons[event.button] = false;
		});
	}

	/**
	 * Checks if a key is currently being held down.
	 *
	 * @param {string} key - The key to check (case-insensitive).
	 * @returns {boolean} `true` if the key is being held down, otherwise `false`.
	 */
	isKeyHeld(key) {
		return this.keys[key.toUpperCase()];
	}

	/**
	 * Checks if a key was pressed once (and resets the state).
	 *
	 * @param {string} key - The key to check (case-insensitive).
	 * @returns {boolean} `true` if the key was pressed, otherwise `false`.
	 */
	isKeyPressed(key) {
		if (this.keys[key.toUpperCase()]) {
			this.keys[key.toUpperCase()] = false;
			return true;
		}
		return false;
	}

	/**
	 * Returns the current mouse position relative to the canvas.
	 *
	 * @returns {Object} An object containing `x` and `y` properties for the mouse position.
	 */
	getMousePosition() {
		return { ...this.mouse };
	}

	/**
	 * Checks if a specific mouse button is currently being held down.
	 *
	 * @param {number} button - The mouse button to check (use `Input.MOUSE` constants).
	 * @returns {boolean} `true` if the mouse button is being held, otherwise `false`.
	 */
	isMouseButtonHeld(button) {
		return this.mouseButtons[button];
	}

	/**
	 * Checks if a specific mouse button was pressed once (and resets the state).
	 *
	 * @param {number} button - The mouse button to check (use `Input.MOUSE` constants).
	 * @returns {boolean} `true` if the mouse button was pressed, otherwise `false`.
	 */
	isMouseButtonPressed(button) {
		if (this.mouseButtons[button]) {
			this.mouseButtons[button] = false;
			return true;
		}
		return false;
	}
}
