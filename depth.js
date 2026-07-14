class DepthEstimator {

    constructor() {

        // Approximate focal length (pixels)
        // You can calibrate this for your own phone later.
        this.focalLength = 900;

        // Approximate real-world heights in meters
        this.objectHeights = {

            person: 1.70,
            bottle: 0.25,
            cup: 0.10,
            chair: 0.90,
            laptop: 0.24,
            tv: 0.60,
            apple: 0.08,
            orange: 0.08,
            banana: 0.20,
            backpack: 0.45,
            book: 0.24,
            keyboard: 0.03,
            mouse: 0.04,
            cell phone: 0.15,
            remote: 0.18

        };

    }

    estimate(prediction) {

        const name = prediction.class;

        if (!(name in this.objectHeights))
            return null;

        const realHeight = this.objectHeights[name];

        const pixelHeight = prediction.bbox[3];

        if (pixelHeight <= 0)
            return null;

        const distance =
            (realHeight * this.focalLength) /
            pixelHeight;

        return distance;

    }

    calibrate(focalLength) {

        this.focalLength = focalLength;

    }

}
