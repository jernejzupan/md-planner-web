class Unit {
    constructor(name, overflow) {
        this.name = name;
        this.overflow = overflow;
        this.base = 1;
        this.round = null;
    }
}

class Value {
    constructor(amount, unit) {
        this.amount = amount;
        this.unit = unit;
    }

    toString() {
        return `${this.amount}${this.unit.name}`;
    }
}

const unitsDescription = [
    ["Y", null],
    ["M", 12],
    ["W", 4],
    ["D", 5],
    ["h", 6],
    ["", 60],
];

function initUnits(description) {
    const units = description.map(([name, overflow]) => new Unit(name, overflow));

    let base = 1;
    for (let i = units.length - 1; i >= 0; i--) {
        units[i].base = base;
        if (units[i].overflow) {
            base *= units[i].overflow;
        }
    }

    for (let unit of units) {
        unit.round = unit.overflow ? Math.floor(unit.overflow / 2) : null;
    }

    return units;
}

const units = initUnits(unitsDescription);

const regexDuration = /^(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(\d+h)?(\d+m|\d+)?$/;

function parseDurationStr(durationStr) {
    const durationMap = {
        m: 1,
        h: 60,
        D: 360,
        W: 1800,
        M: 7200,
        Y: 86400,
    };

    durationStr = durationStr.trim();
    const matches = durationStr.match(regexDuration);
    if (!matches) return null;

    let totalMinutes = 0;
    for (let i = 1; i < matches.length; i++) {
        const group = matches[i];
        if (group) {
            const unit = "YMWDhm".includes(group.slice(-1)) ? group.slice(-1) : "m";
            const value = parseInt(group.replace(unit, ""), 10);
            totalMinutes += value * durationMap[unit];
        }
    }

    return totalMinutes;
}

function convert(base, units) {
    const values = units.map(unit => new Value(0, unit));
    let remainder = base;

    for (let value of values) {
        value.amount = Math.floor(remainder / value.unit.base);
        if (value.amount > 0) {
            remainder %= value.unit.base;
        }
    }

    return values;
}

function roundUp(values, places = 2) {
    let idxOfRound = values.length - places - 1;

    for (let value of values) {
        if (value.amount) break;
        idxOfRound -= 1;
    }

    if (idxOfRound < 0) return values;

    for (let i = values.length - 1; i >= 0; i--) {
        const value = values[i];
        const idx = values.length - 1 - i;

        if (idx < idxOfRound) {
            value.amount = 0;
            continue;
        }

        if (idx === idxOfRound) {
            const shouldRound = value.amount >= value.unit.round;
            value.amount = 0;
            if (!shouldRound) break;
        }

        if (idx > idxOfRound) {
            value.amount += 1;
            if (value.unit.overflow === null || value.amount < value.unit.overflow) break;
            value.amount = 0;
        }
    }

    return values;
}

function trimZeros(values) {
    let idxHigh = 0;
    let idxLow = 0;

    for (let value of values) {
        if (value.amount !== 0) break;
        idxHigh++;
    }

    for (let i = values.length - 1; i >= 0; i--) {
        if (values[i].amount !== 0) break;
        idxLow++;
    }

    idxLow = values.length - idxLow;

    if (idxHigh > idxLow) return [values[values.length - 1]];
    return values.slice(idxHigh, idxLow);
}

export class Duration {
    constructor(totalMinutes, derived = false) {
        this.totalMinutes = totalMinutes;
        this.derived = derived;
    }

    fmt() {
        const isNeg = this.totalMinutes < 0;
        let values = convert(Math.abs(this.totalMinutes), units);
        values = roundUp(values);
        values = trimZeros(values);
        return values.map(v => `${isNeg ? '-' : ''}${v.amount}${v.unit.name}`).join('');
    }

    add(other) {
        return new Duration(this.totalMinutes + other.totalMinutes);
    }

    sub(other) {
        return new Duration(this.totalMinutes - other.totalMinutes);
    }

    neg() {
        return new Duration(-this.totalMinutes);
    }

    eq(other) {
        return this.totalMinutes === other.totalMinutes;
    }

    static parse(text) {
        const minutes = parseDurationStr(text);
        return minutes !== null ? new Duration(minutes) : null;
    }

    static isValid(text) {
        return parseDurationStr(text) !== null;
    }
}
