class Detector {
    constructor() {
        this.model = null;
        this.ready = false;
    }

    async load() {
        this.model = await cocoSsd.load({
            base: "lite_mobilenet_v2"
        });
        this.ready = true;
        console.log("Detector loaded");
    }

    async detect(video) {
        if (!this.ready) return [];
        return await this.model.detect(video);
    }
}

window.Detector = Detector;
