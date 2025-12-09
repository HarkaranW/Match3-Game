import { context } from '../globals.js';
import { ImageName, TileColour, TilePattern } from '../enums.js';
import Sprite from '../../lib/Sprite.js';

export default class Tile {
	static SIZE = 32;

	/**
	 * The individual tiles that make up our game board. Each Tile can have a
	 * color and a pattern, with the patterns adding extra points to the matches.
	 *
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} colour
	 * @param {Number} pattern
	 * @param {Array} sprites
	 */
	constructor(
		x,
		y,
		colour = TileColour.Beige,
		pattern = TilePattern.Flat,
		sprites = []
	) {
		// Board position.
		this.boardX = x;
		this.boardY = y;

		// Canvas position.
		this.x = this.boardX * Tile.SIZE;
		this.y = this.boardY * Tile.SIZE;

		// Tile appearance.
		this.colour = colour;
		this.pattern = pattern;
		this.sprites = sprites;
	}

	/**
	 * Retrieves all tile sprites from the sprite sheet.
	 *
	 * @returns An array of tile sprites.
	 */
	static generateSprites(images) {
		const ROWS = 9;
		const COLUMNS = 6;
		const SPLIT_POINT = 2;
		const sprites = new Array();
		let x = 0;
		let y = 0;
		let counter = 0;

		for (let row = 0; row < ROWS; row++) {
			// The "split point" exists because one row in the sprite sheet contains 2 colours.
			for (let i = 0; i < SPLIT_POINT; i++) {
				sprites[counter] = [];

				for (let column = 0; column < COLUMNS; column++) {
					const sprite = new Sprite(
						images.get(ImageName.SpriteSheet),
						x,
						y,
						Tile.SIZE,
						Tile.SIZE
					);

					sprites[counter].push(sprite);
					x += Tile.SIZE;
				}

				counter++;
			}

			y += Tile.SIZE;
			x = 0;
		}

		return sprites;
	}

	render(x, y) {
		this.sprites[this.colour][this.pattern].render(
			context,
			this.x + x,
			this.y + y
		);
	}
}
