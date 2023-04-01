function drawTimeCanvas(ctx, progress) {
    ctx.clearRect(100, 0, 300, 300);

    ctx.beginPath();
    ctx.arc(225, 110, 95, 0 * Math.PI, 2 * Math.PI);
    const grd = ctx.createRadialGradient(225, 110, 95, 90, 60, 100);
    grd.addColorStop(0, "rgba(0, 255, 0, 0.5)");
    grd.addColorStop(1, "rgba(225, 228, 30, 0.5)");
    ctx.fillStyle = grd;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(225, 110, 95, 1.5 * Math.PI, progress * Math.PI, true); /* progress range(-0.5(full);1.5(empty)) */
    ctx.lineWidth = 7;
    const ratio = (progress + 0.5) / 2;
    const red = ratio * 255;
    const green = (1 - ratio) * 255;
    ctx.strokeStyle = `rgb(${red}, ${green}, 0)`;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(225, 110, 100, 0 * Math.PI, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.stroke();
}

window.addEventListener('load', () => {
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");

    drawTimeCanvas(ctx, -0.5);

    const playPauseButton = document.getElementById("play-pause");
    playPauseButton.style.background = "url(./assets/play.png) no-repeat";
    playPauseButton.style.backgroundSize = "cover";
    playPauseButton.name = 'play';

    const stopButton = document.getElementById("stop");
    stopButton.style.background = "url(./assets/stop.png) no-repeat";
    stopButton.style.backgroundSize = "cover";

    const duration = document.querySelectorAll("#duration > p");
    const timeValues = {
        hours: duration[0],
        minutes: duration[2],
        seconds: duration[4],
        ms: duration[6]
    }

    new Timer(timeValues, playPauseButton, stopButton, ctx);
});

class Timer {
    constructor(durationInput, playPauseButton, stopButton, ctx) {
        this.durationInput = durationInput;
        this.playPauseButton = playPauseButton;
        this.stopButton = stopButton;
        this.running = false;
        this.ctx = ctx;

        this.start = this.start.bind(this);
        this.play = this.play.bind(this);
        this.stop = this.stop.bind(this);
        this.tick = this.tick.bind(this);
        this.displayTime = this.displayTime.bind(this);

        this.init();
    }

    init() {
        for (let element in this.durationInput) {
            this.durationInput[element].addEventListener('input', e => this.onDurationChange(e));
        }
        this.playPauseButton.addEventListener('click', this.start);
    }

    onDurationChange(e) {
        if (this.running) return;
        // if numerical incoherence, print in red
        if (!e.target.innerText.match(/^[0-9]{1,2}$/)) {
            e.target.style.color = 'red';
        } else {
            e.target.style.color = 'inherit';
        };
    }

    validation() {
        for (let element in this.durationInput) {
            const elem = this.durationInput[element];
            if (elem.style.color == 'red') {
                alert('Please correct mistakes in duration.'); return;
            }
        }
        if (Object.values(this.durationInput).every(value => value.innerText == '00')) {
            alert('The minimal duration is 1 milisecond.'); return;
        }
    }

    start() {
        this.validation();
        // prevents edition of the duration
        for (let element in this.durationInput) {
            this.durationInput[element].style.contenteditable = "false";
        }
        // launches the timer
        this.timeLeft = this.timeToTimeStamp(this.durationInput);
        this.initialDuration = this.timeLeft;
        this.playPauseButton.removeEventListener('click', this.start);
        this.playPauseButton.addEventListener('click', this.play);
        this.stopButton.addEventListener('click', this.stop);
        this.play();
    }

    // starts or pauses the timer for the specified/remaining duration
    play() {
        if (this.playPauseButton.name == 'play') { /* play */
            this.running = true;
            this.playPauseButton.style.background = "url(./assets/pause.png) no-repeat";
            this.playPauseButton.name = 'pause';
            this.startTime = Date.now();
            this.interval = setInterval(this.stop, this.timeLeft);
            this.tick();
        } else { /* pause */
            this.running = false;
            this.playPauseButton.style.background = "url(./assets/play.png) no-repeat";
            this.playPauseButton.name = 'play';
            this.timeLeft += this.startTime - Date.now();
            clearInterval(this.interval);
        }
    }

    stop() {
        this.running = false;
        this.timeLeft = 0;
        this.startTime = 0;
        this.playPauseButton.style.background = "url(./assets/play.png) no-repeat";
        this.playPauseButton.name = 'play';
        clearInterval(this.interval);
        drawTimeCanvas(this.ctx, 1.5);
        // also needs to resume edition of the duration
        for (let element in this.durationInput) {
            this.durationInput[element].style.contenteditable = "true";
            this.durationInput[element].innerText = '00';
        }
        this.stopButton.removeEventListener('click', this.stop);
        this.playPauseButton.removeEventListener('click', this.play);
        this.playPauseButton.addEventListener('click', this.start);
    }

    //displays time with dynamic time format
    displayTime(hours, minutes, seconds, ms) {
        this.durationInput['hours'].innerText = hours > 9 ? hours : "0" + hours;
        this.durationInput['minutes'].innerText = minutes > 9 ? minutes : "0" + minutes;
        this.durationInput['seconds'].innerText = seconds > 9 ? seconds : "0" + seconds;
        this.durationInput['ms'].innerText = ms > 9 ? ms : "0" + ms;
    }

    // converts input to timestamp
    timeToTimeStamp(durationInput) {
        const hours = parseInt(durationInput['hours'].innerText) * 60 * 60 * 1000;
        const minutes = parseInt(durationInput['minutes'].innerText) * 60 * 1000;
        const seconds = parseInt(durationInput['seconds'].innerText) * 1000;
        const ms = parseInt(durationInput['ms'].innerText) * 10;
        return hours + minutes + seconds + ms;
    }

    // converts duration to hh:mm:ss:ms
    timeStampToTime(duration) {
        let remains;

        const hours = Math.floor(duration / 60 / 60 / 1000);
        remains = duration % (60 * 60 * 1000);

        const minutes = Math.floor(remains / 60 / 1000);
        remains = remains % (60 * 1000);

        const seconds = Math.floor(remains / 1000);
        remains = Math.floor((remains % 1000) / 10); /* to force 2 digits */

        return [hours, minutes, seconds, remains];
    }

    // Use a RAF to update the timer and draw the circle
    tick() {
        if (!this.running) return;

        const timeLeft = this.startTime + this.timeLeft - Date.now();

        // update the displayed times
        const [hours, minutes, seconds, ms] = this.timeStampToTime(timeLeft);
        this.displayTime(hours, minutes, seconds, ms);

        //redraw the time border canvas
        drawTimeCanvas(this.ctx, (((this.initialDuration - timeLeft) / this.initialDuration) * 2) - 0.5)

        // call tick recursively
        requestAnimationFrame(this.tick);
    }
}