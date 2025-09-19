import { Duration } from '@/lib/Duration.js';

const regexTime = /^\d{1,2}:\d{2}$/;

export class Time {
    constructor(date, derived = false) {
        this.time = date;
        this.derived = derived;
    }

    fmt() {
        const hours = this.time.getHours().toString().padStart(2, '0');
        const minutes = this.time.getMinutes().toString().padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;
        return this.derived ? `*${timeStr}*` : timeStr;
    }

    add(duration) {
        const newTime = new Date(this.time.getTime() + duration.totalMinutes * 60000);
        return new Time(newTime, true);
    }

    sub(other) {
        if (other instanceof Duration) {
            const newTime = new Date(this.time.getTime() - other.totalMinutes * 60000);
            return new Time(newTime, true);
        } else if (other instanceof Time) {
            const diffMinutes = Math.floor((this.time - other.time) / 60000);
            return new Duration(diffMinutes, true);
        }
        throw new Error("Unsupported operand type for subtraction");
    }

    eq(other) {
        return (
            this.time.getHours() === other.time.getHours() &&
            this.time.getMinutes() === other.time.getMinutes()
        );
    }

    static parse(text) {
        if (regexTime.test(text)) {
            const [hours, minutes] = text.split(':').map(Number);
            const now = new Date();
            now.setHours(hours, minutes, 0, 0);
            return new Time(now);
        }
        return null;
    }

    static isValid(text) {
        return regexTime.test(text);
    }
}
