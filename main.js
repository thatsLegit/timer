window.addEventListener('load', () => {
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.arc(225, 110, 95, 0*Math.PI,2*Math.PI);

    const grd = ctx.createRadialGradient(225, 110, 95, 90, 60, 100);
    grd.addColorStop(0, "rgba(0, 255, 0, 0.5)");
    grd.addColorStop(1, "rgba(225, 228, 30, 0.5)");
    ctx.fillStyle = grd;
    ctx.fill();

    ctx.lineWidth = 7;
    ctx.strokeStyle = "green";
    ctx.stroke()

    ctx.beginPath();
    ctx.arc(225, 110, 100, 0*Math.PI,2*Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.stroke()

    const playButton = document.getElementById("play-pause");
    playButton.style.background = "url(./assets/play.png) no-repeat";
    playButton.style.backgroundSize = "cover";
    playButton.name = 'play';

    const stopButton = document.getElementById("stop");
    stopButton.style.background = "url(./assets/stop.png) no-repeat";
    stopButton.style.backgroundSize = "cover";

    const duration = document.querySelectorAll("#duration > p");
    const timeValues = {
        hours: duration[0], 
        minutes: duration[2], 
        seconds: duration[4]
    }

    new Timer(timeValues, playButton, stopButton);
});

class Timer {
    constructor(durationInput, playButton, stopButton) {
        this.durationInput = durationInput;
        this.playButton = playButton;
        this.stopButton = stopButton;
        this.running = false;

        this.onDurationChange = this.onDurationChange.bind(this);
        this.start = this.start.bind(this);
        this.play = this.play.bind(this);
        this.stop = this.stop.bind(this);
        this.tick = this.tick.bind(this);

        this.init();
    }

    init() {
        for (let element in this.durationInput) {
            this.durationInput[element].addEventListener('input', e => this.onDurationChange(e));
        }
        this.playButton.addEventListener('click', this.start);
        this.stopButton.addEventListener('click', this.stop);
    }

    // Launches the timer
    start() {
        // also needs to check for any numerical incoherence
        for (let element in this.durationInput) {
            const elem = this.durationInput[element];
            if(elem.style.color == 'red') {
                alert('Please correct mistakes in duration.'); return;
            }
        }
        if(Object.values(this.durationInput).every(value => value.innerText == '00')) {
            alert('The minimal duration is 1 second.'); return;
        }
        // also needs to prevent edition of the duration
        for (let element in this.durationInput) {
            this.durationInput[element].style.contenteditable = "false";
        }
        // launches the timer
        this.duration = this.timeToTimeStamp(this.durationInput);
        this.playButton.removeEventListener('click', this.start);
        this.playButton.addEventListener('click', this.play);
        this.play(true);
    }

    // starts or resumes the timer for the specified/remaining duration
    play(start=false) {
        if(this.playButton.name == 'play') { /* start */
            this.playButton.style.background = "url(./assets/pause.png) no-repeat";
            this.playButton.name = 'pause';
            this.running = true;
            if(start) this.marker = Date.now();
            this.tick();
        } else { /* pause */
            this.running = false;
            this.duration = this.duration + this.marker - Date.now();
            this.playButton.style.background = "url(./assets/play.png) no-repeat";
            this.playButton.name = 'play';
        }
    }

    stop() {
        // also needs to resume edition of the duration
        for (let element in this.durationInput) {
            this.durationInput[element].style.contenteditable = "true";
            this.durationInput[element].innerText = '00';
        }
        // resets the timer
        this.running = false;
        this.duration = 0;
        this.marker = 0;
        this.playButton.style.background = "url(./assets/play.png) no-repeat";
        this.playButton.name = 'play';
        this.playButton.removeEventListener('click', this.play);
        this.playButton.addEventListener('click', this.start);
    }

    onDurationChange(e) {
        if(this.running) return;
        // if numerical incoherence, print in red
        if(!e.target.innerText.match(/^[0-9]{2}$/)) {
            e.target.style.color = 'red';
        } else {
            e.target.style.color = 'inherit';
        }; 
    }

    // Use a RAF to update the timer and draw the circle
    tick() {                       
        if(!this.running) return; 
        const duration = this.marker + this.duration - Date.now();

        if(duration <= 0) {
            this.stop();
            alert('Time is over!');
            return;
        }
        
        // update the displayed times
        const [hours, minutes, seconds] = this.timeStampToTime(duration);

        this.durationInput['hours'].innerText = hours > 9 ? hours : "0" + hours;
        this.durationInput['minutes'].innerText = minutes > 9 ? minutes : "0" + minutes;
        this.durationInput['seconds'].innerText = seconds > 9 ? seconds : "0" + seconds;

        // call tick recursively
        requestAnimationFrame(this.tick);
    }

    // converts input to timestamp
    timeToTimeStamp(durationInput) {
        const hours = parseInt(durationInput['hours'].innerText)*60*60*1000;
        const minutes = parseInt(durationInput['minutes'].innerText)*60*1000;
        const seconds = parseInt(durationInput['seconds'].innerText)*1000;
        return hours + minutes + seconds;
    }

    // converts duration to hh:mm:ss
    timeStampToTime(duration) {
        let remains;

        const hours = Math.floor(duration/60/60/1000);
        remains = duration - hours * 60*60*1000;

        const minutes = Math.floor(remains/60/1000);
        remains = duration - minutes * 60*1000;

        const seconds = Math.floor(remains/1000);

        return [hours, minutes, seconds];
    }
}