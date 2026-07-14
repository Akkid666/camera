class HUD {

    constructor(canvas) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

    }

    clear() {

        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

    }

    drawCrosshair() {

        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2;

        this.ctx.strokeStyle = "lime";
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x - 30, y);
        this.ctx.lineTo(x + 30, y);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 30);
        this.ctx.lineTo(x, y + 30);
        this.ctx.stroke();

    }

    drawBox(prediction, distance = null, height = null) {

        const ctx = this.ctx;

        const [x, y, w, h] = prediction.bbox;

        ctx.strokeStyle = "lime";
        ctx.lineWidth = 3;

        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = "lime";
        ctx.font = "18px Arial";

        let text = prediction.class;

        if (prediction.score) {

            text +=
                " " +
                Math.round(prediction.score * 100) +
                "%";

        }

        if (distance !== null) {

            text +=
                " | " +
                distance.toFixed(2) +
                "m";

        }

        if (
            prediction.class === "person" &&
            height !== null
        ) {

            text +=
                " | " +
                height.toFixed(2) +
                "m";

        }

        ctx.fillText(text, x, y - 8);

    }

    drawSkeleton(landmarks) {

        if (!landmarks) return;

        const ctx = this.ctx;

        ctx.strokeStyle = "lime";
        ctx.fillStyle = "lime";
        ctx.lineWidth = 2;

        landmarks.forEach(point => {

            const x =
                point.x * this.canvas.width;

            const y =
                point.y * this.canvas.height;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );

            ctx.fill();

        });

    }

    drawFPS(fps) {

        this.ctx.fillStyle = "lime";
        this.ctx.font = "20px Arial";

        this.ctx.fillText(
            "FPS: " + fps,
            20,
            30
        );

    }

    drawObjectCount(count) {

        this.ctx.fillStyle = "lime";
        this.ctx.font = "20px Arial";

        this.ctx.fillText(
            "Objects: " + count,
            20,
            60
        );

    }

}
