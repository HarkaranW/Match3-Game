import { ImageName } from "../enums.js";
import { CANVAS_WIDTH, images } from "../globals.js";

export default class Scene {
	constructor() {
		this.backgroundX = 0;
		this.backgroundScrollSpeed = 100;
		this.snapPoint = -950;
	}

	update(dt) {
		this.backgroundX -= this.backgroundScrollSpeed * dt;

		if (this.backgroundX <= this.snapPoint + CANVAS_WIDTH) {
			this.backgroundX = 0;
		}
	}

	render() {
		images.render(ImageName.Background, this.backgroundX, 0);
	}
}
