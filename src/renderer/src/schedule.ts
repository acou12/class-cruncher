import sectionsString from './assets/sectiosn.json?raw'
import { fixedTime, randomColor, superCartesianProduct } from './util'

class Course {
  constructor(public name: string, public color: string) {}
}

class Meeting {
  constructor(public startTime: number, public endTime: number, public course: Course) {}
}

class Day {
  constructor(public meetings: Meeting[]) {}

  gaps(): number[] {
    const result = []
    this.meetings.sort((x, y) => x.startTime - y.startTime)
    for (let i = 0; i < this.meetings.length - 1; i++) {
      result.push(this.meetings[i + 1].startTime - this.meetings[i].endTime)
    }
    return result
  }
}

export class Schedule {
  constructor(public days: Day[], public courses: Course[]) {}

  allMeetings(): Meeting[] {
    return this.days.flatMap((day) => day.meetings)
  }

  valid(): boolean {
    return !this.days.some((day) =>
      day.meetings.some((m1) =>
        day.meetings.some(
          (m2) =>
            m1 !== m2 &&
            ((m1.startTime <= m2.startTime && m2.startTime <= m1.endTime) ||
              (m1.startTime <= m2.endTime && m2.endTime <= m1.endTime))
        )
      )
    )
  }

  totalGaps(): number {
    const gaps = this.days.flatMap((day) => day.gaps())
    return [0, ...gaps].reduce((acc, x) => acc + x)
  }

  maxEndTime(): number {
    const lasts = this.days.map((day) => day.meetings.map((meeting) => meeting.endTime).at(-1))
    return lasts.reduce((acc, x) => Math.max(acc, x))
  }
}

type Data = {
  sections: {
    id: string
    subjectId: string
    course: string
    creditsMax: number
    meetings: {
      days: string
      daysRaw: string
      startTime: number
      endTime: number
      location: string
    }[]
  }[]
  schedules: {
    id: string
    combination: string[]
  }[]
}

const scheduleFromSectionSet = (sections: Data['sections']): Schedule => {
  const days: Record<string, Day> = {
    M: new Day([]),
    T: new Day([]),
    W: new Day([]),
    R: new Day([]),
    F: new Day([])
  }

  sections.forEach((section) => {
    section.meetings.forEach((meeting) => {
      for (let i = 0; i < meeting.daysRaw.length; i++) {
        days[meeting.daysRaw.charAt(i)].meetings.push(
          new Meeting(
            fixedTime(meeting.startTime),
            fixedTime(meeting.endTime),
            courses[`${section.subjectId} ${section.course}`]
          )
        )
      }
    })
  })

  const schedule = new Schedule(Object.values(days), Object.values(courses))

  return schedule
}

export const randomSchedule = (): Schedule => {
  const selectedSections: Data['sections'] = []

  Object.keys(sections).forEach((sectionName) => {
    if (Math.random() < 0.5) {
      const sectionSet = sections[sectionName]
      selectedSections.push(sectionSet[Math.floor(Math.random() * sectionSet.length)])
    }
  })

  if (
    selectedSections.length === 0 ||
    selectedSections.map((section) => section.creditsMax).reduce((acc, x) => acc + x) != 18
  )
    return randomSchedule()

  const schedule = scheduleFromSectionSet(selectedSections)

  if (!schedule.valid()) {
    return randomSchedule()
  }

  return schedule
}

type SectionMap = Record<string, Data['sections']>

export const sections: SectionMap = JSON.parse(sectionsString)
const courses: Record<string, Course> = {}

for (const section in sections) {
  courses[section] = new Course(section, randomColor())
}

export const allSchedules = Array(5000)
  .fill(0)
  .map(() => randomSchedule())

console.log('Scheds loaded')
