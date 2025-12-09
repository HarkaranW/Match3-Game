import Graphic from "./Graphic.js";

export default class Images {
	/**
	 * Maintains an object (images) with all the Graphic objects
	 * which can be referenced/drawn at any point in the game.
	 *
	 * @param {CanvasRenderingContext2D} context
	 */
	constructor(context) {
		this.context = context;
		this.images = {};
	}

	/**
	 * Initializes the images object with Graphic objects
	 * that are defined by imageDefinitions.
	 *
	 * @param {Array} imageDefinitions Contains image data from config.json.
	 */
	load(imageDefinitions) {
		imageDefinitions.forEach((imageDefinition) => {
			this.images[imageDefinition.name] = new Graphic(
				imageDefinition.path,
				imageDefinition.width,
				imageDefinition.height,
			);
		});
	}

	get(name) {
		return this.images[name];
	}

	render(name, x, y) {
		this.get(name).render(this.context, x, y);
	}
}
