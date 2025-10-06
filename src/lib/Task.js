import { Duration } from '@/lib/Duration.js';
import { Time } from '@/lib/Timing.js';

export class Task {
    constructor({
        dash = null,
        is_completed = null,
        time = null,
        duration = null,
        group = null,
        name = null,
        info = null,
        children = []
    } = {}) {
        this.dash = dash;
        this.is_completed = is_completed;
        this.time = time;
        this.duration = duration;
        this.group = group;
        this.name = name;
        this.info = info;
        this.children = children;
    }

    fmt(clean = false) {
        let is_completed = this.is_completed === null ? null : this.is_completed ? "[x]" : "[ ]";
        let time = this.time?.fmt() ?? null;
        let duration = this.duration?.fmt() ?? null;
        duration = duration === "0" ? null : duration;
        let group = this.group ? "@"+this.group : null;
        let res = [
            this.dash,
            is_completed,
            time,
            duration,
            this.name,
            group,
            this.info
        ].reduce((out, value, index) => {
            let separator = [2,3].includes(index) ? "\t" : " ";
            if (value===null && out!=="" && separator==="\t") {
                return out+separator
            }
            if (value===null) return out;
            return out + value + separator;
        }, "")

        return res;
        
        
    }

    update() {
        this._eval_duration();
        this._inherit_time();
        this._forward_eval_time();
        this._backward_eval_time();
    }

    get leaf() {
        return this.children.length === 0;
    }

    get time_end() {
        return this.time && this.duration ? this.time.add(this.duration) : null;
    }

    _flatten(res = []) {
        res.push(this);
        for (const child of this.children) {
            child._flatten(res);
        }
        return res;
    }

    _eval_duration() {
        if (!this.leaf) {
            this.duration = this.children.reduce(
                (acc, child) => acc.add(child._eval_duration()),
                new Duration(0)
            );
        }
        this.duration = this.duration || new Duration(0);
        return this.duration;
    }

    _inherit_time(time = null) {
        if (this.time) {
            time = this.time;
        } else if (time) {
            this.time = time.add(new Duration(0));
        }
        if (this.children.length > 0) {
            this.children[0]._inherit_time(time);
        }
    }

    _forward_eval_time() {
        const tasks = this._flatten();
        let time = null;

        for (const task of tasks) {
            if (!task.time) {
                task.time = time;
            }
            if (task.time) {
                const offset = task.leaf ? task.duration : new Duration(0);
                time = task.time.add(offset);
            }
        }
    }

    _backward_eval_time() {
        const tasks = this._flatten().reverse();
        let time = null;

        for (const task of tasks) {
            if (task.time) {
                time = task.time;
            } else if (time) {
                const offset = task.leaf ? task.duration : new Duration(0);
                task.time = time.sub(offset);
                time = task.time;
            }
        }
    }

    static parse(line) {
        return _parse_task(line);
    }
}

const regexCompleted = /^\[(.*)\]$/;
const regexName = /^[a-zA-Z0-9>\-:]+$/;
const regexGroup = /^@[a-zA-Z0-9\-:]+$/;
const regexTaskTokenIds = /^-?c?[tT]?[dD]?n?g?o*$/;
const regexNameSub = /[ctTdDn]/;

function tokenType(idx, tokenStr) {
    if (tokenStr === "-" && idx === 0) return "-";
    if (idx > 5) return "o";

    if (regexCompleted.test(tokenStr)) return "c";
    if (Time.isValid(tokenStr)) return Time.isDerived(tokenStr) ? "T" : "t";
    if (Duration.isValid(tokenStr)) return "d";
    if (regexName.test(tokenStr)) return "n";
    if (regexGroup.test(tokenStr)) return "g";

    return "o";
}

export function _generate_token_id(taskStr) {
    taskStr = taskStr.trim().replace("[ ]", "[e]");
    const tokens = taskStr.split(/\s+/);
    const tokenString = tokens.map((t, i) => {
        const tt = tokenType(i, t);
        //console.log(`tokenType(${i},${t}) -> ${tt}`);
        return tt;
    }).join("");

    const idx = tokenString.indexOf("n");
    let before = tokenString;
    let separator = "";
    let after = "";

    if (idx !== -1) {
        before = tokenString.slice(0, idx);
        separator = "n";
        after = tokenString.slice(idx + 1);
    }

    const cleanedAfter = after.replace(/[ctTdDn]/g, "o");
    return before + separator + cleanedAfter;
}

export function _parse_task(line) {
    const taskStr = line.trim().replace("[ ]", "[e]");
    const tokenIds = _generate_token_id(taskStr);
    if (!regexTaskTokenIds.test(tokenIds)) {
        console.warn("CANNOT PARSE:", tokenIds, taskStr);
        return null;
    }

    const tokens = taskStr.split(/\s+/);
    //console.log(tokens)
    let dash = null;
    let is_completed = null;
    let time = null;
    let duration = null;
    let group = null;
    let name = null;
    let info = "";

    tokens.forEach((tokenStr, i) => {
        const tokenId = tokenIds[i];
        if (tokenId === "-") dash = "-"
        if (tokenId === "c") is_completed = regexCompleted.exec(tokenStr)[1] === "x";
        if (tokenId === "t") time = Time.parse(tokenStr);
        if (tokenId === "d") duration = Duration.parse(tokenStr);
        if (tokenId === "g") group = tokenStr.replace("@", "");
        if (tokenId === "n") name = tokenStr;
        if (tokenId === "o") info += tokenStr + " ";
    });

    info = info.trim() || null;

    return new Task({ dash, is_completed, time, duration, group, name, info });
}
