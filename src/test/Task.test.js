import { describe, it, expect } from 'vitest'
import { Duration } from '@/lib/Duration.js'
import { Time } from '@/lib/Timing.js'
import { Task, _generate_token_id } from '@/lib/Task.js'

describe('Task.update', () => {
  it('evaluates duration from children', () => {
    const task = new Task({
      time: Time.parse("15:30"),
      duration: new Duration(30),
      name: "clean-house",
      children: [
        new Task({ duration: new Duration(25), name: "kitchen" }),
        new Task({ duration: new Duration(10), name: "dishwasher" })
      ]
    })

    task._eval_duration()
    expect(task.duration.totalMinutes).toBe(35)
  })
})

describe('_generate_token_id', () => {
  it('generates correct token strings', () => {
    expect(_generate_token_id("- [x] 15:30 15 name info info")).toBe("-ctdnoo")
    expect(_generate_token_id("- 15:30 name @info info")).toBe("-tngo")
    expect(_generate_token_id("- name-bob:fuu lunch with someone 15:30 1h")).toBe("-nooooo")
    expect(_generate_token_id("- [ ] 10 open")).toBe("-cdn")
  })
})

describe('Task.parse', () => {
  it('parses minimal task', () => {
    expect(Task.parse("- open")).toEqual(new Task({ name: "open" }))
  })

  it('parses task with duration', () => {
    expect(Task.parse("- 10 open")).toEqual(new Task({ duration: new Duration(10), name: "open" }))
  })

  it('parses task with duration and info', () => {
    expect(Task.parse("- 10 open info")).toEqual(new Task({ duration: new Duration(10), name: "open", info: "info" }))
  })

  it('parses task with completion status', () => {
    expect(Task.parse("- [ ] 10 open")).toEqual(new Task({ is_completed: false, duration: new Duration(10), name: "open" }))
  })

  it('parses task with time and completion', () => {
    expect(Task.parse("- [x] 15:30 10 open")).toEqual(new Task({
      is_completed: true,
      time: Time.parse("15:30"),
      duration: new Duration(10),
      name: "open"
    }))
  })

  it('parses task with group', () => {
    expect(Task.parse("- [x] 15:30 10 open @group")).toEqual(new Task({
      is_completed: true,
      time: Time.parse("15:30"),
      duration: new Duration(10),
      name: "open",
      group: "group"
    }))
  })

  it('parses task with group and info', () => {
    expect(Task.parse("- [x] 15:30 10 open @group info info")).toEqual(new Task({
      is_completed: true,
      time: Time.parse("15:30"),
      duration: new Duration(10),
      name: "open",
      group: "group",
      info: "info info"
    }))
  })
})
