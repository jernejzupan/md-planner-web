import { Task } from '@/lib/Task.js';

export class Plan {
    constructor(root_task, input_str, clean = false) {
        this.root_task = root_task;
        this.input_str = input_str;
        this.clean = clean;
    }

    get_lines() {
        return _generate_plan_text(this.root_task.children, 0, this.clean);
    }

    get_str() {
        if (this.root_task.children?.length) {
            return this.get_lines().join('').trimEnd();
        }
        return String(this);
    }

    static from_str(text) {
        const clean = text.includes("__CPLAN__");
        const lines = text.split("\n");
        const root_task = _parse_tasks(lines);
        return new Plan(root_task, text, clean);
    }

    update() {
        this.root_task.update();
    }
}

function parse_indentation(line) {
    const lineExpanded = line.replace(/\t/g, "    ");
    const match = lineExpanded.match(/^(\s*)/);
    return match ? match[1].length : 0;
}

function _parse_tasks(lines) {
    const tasks = [];
    const stack = [];

    for (let rawLine of lines) {
        const line = rawLine.trimEnd();
        if (!line.trim()) continue; // skip empty lines

        const indent = parse_indentation(line);
        const task = Task.parse(line);

        if (task) {
            while (stack.length && indent <= stack[stack.length - 1][0]) {
                stack.pop();
            }
            if (stack.length) {
                stack[stack.length - 1][1].children.push(task);
            } else {
                tasks.push(task);
            }
            stack.push([indent, task]);
        }
    }

    return new Task({ name: "root", children: tasks });
}

function _generate_plan_text(tasks, indent = 0, clean = false) {
    const lines = [];
    for (const task of tasks) {
        lines.push("\t".repeat(indent) + task.fmt(clean) + "\n");
        if (task.children?.length) {
            lines.push(..._generate_plan_text(task.children, indent + 1, clean));
        }
    }
    return lines;
}
