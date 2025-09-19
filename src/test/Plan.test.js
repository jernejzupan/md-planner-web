import { describe, it, expect } from 'vitest'
import { Plan } from '@/lib/Plan.js'

// Original plan lines
const planLines = [
  "- morning-routine\n",
  "  - 5 brush-teeth\n",
  "  - 10 coffee\n",
  "- 15:30 30 clean-house\n",
  "  - 25 kitchen\n",
  "  - 16:50 10 dishwasher\n",
  "- 15 walk-dog\n",
  "  - 5 get-leash\n",
  "  - 10 cjx9:home1->home2\n",
  "  - done\n",
]

// Updated plan lines after `.update()`
const updatedPlanLines = [
  "- *15:15* 15 morning-routine\n",
  "  - *15:15* 5 brush-teeth\n",
  "  - *15:20* 10 coffee\n",
  "- 15:30 35 clean-house\n",
  "  - *15:30* 25 kitchen\n",
  "  - 16:50 10 dishwasher\n",
  "- *17:00* 15 walk-dog\n",
  "  - *17:00* 5 get-leash\n",
  "  - *17:05* 10 cjx9:home1->home2\n",
  "  - *17:15* done\n",
]

const planText = planLines.join('').trimEnd()
const updatedPlanText = updatedPlanLines.join('').trimEnd()

const fileTextTemplate = `
text text text
text text text

__PLAN__
__PLAN_LINES__

text text text
text text text
`

describe('Plan parsing and formatting', () => {
  it('parses plan from string and returns original text', () => {
    const fileText = fileTextTemplate.replace('__PLAN_LINES__', planText)
    const plan = Plan.from_str(fileText)
    const out = plan.get_str()
    expect(out).toBe(planText)
  })

  it('parses plan from string and returns original lines', () => {
    const fileText = fileTextTemplate.replace('__PLAN_LINES__', planText)
    const plan = Plan.from_str(fileText)
    const out = plan.get_lines()
    expect(out).toEqual(planLines)
  })

  it('updates plan and returns updated text', () => {
    const fileText = fileTextTemplate.replace('__PLAN_LINES__', planText)
    const plan = Plan.from_str(fileText)
    plan.update()
    plan.update() // second update to match original test
    const out = plan.get_str()
    expect(out).toBe(updatedPlanText)
  })
})
