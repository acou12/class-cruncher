import { couldStartTrivia } from 'typescript'
import sectionsString from './assets/sectiosn.json?raw'
import { fixedTime, randomColor } from './util'

class Course {
  constructor(public name: string, public color: string) {}
}

class Meeting {
  constructor(public startTime: number, public endTime: number, public course: Course) {}
}

class Day {
  constructor(public meetings: Meeting[]) {}
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
}

type Data = {
  sections: {
    id: string
    subjectId: string
    course: string
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

type SectionMap = Record<string, Data['sections']>

export const sections: SectionMap = JSON.parse(sectionsString)

const courses: Record<string, Course> = {}

for (const section in sections) {
  courses[section] = new Course(section, randomColor())
}

export let schedule: Schedule = new Schedule([], Object.values(courses))

export const randomSchedule = (): Schedule => {
  const days: Record<string, Day> = {
    M: new Day([]),
    T: new Day([]),
    W: new Day([]),
    R: new Day([]),
    F: new Day([])
  }

  const selectedSections: Data['sections'] = []

  Object.keys(sections).forEach((sectionName) => {
    const sectionSet = sections[sectionName]
    selectedSections.push(sectionSet[Math.floor(Math.random() * sectionSet.length)])
  })

  selectedSections.forEach((section) => {
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

  if (!schedule.valid()) {
    return randomSchedule()
  }

  return schedule
}

schedule = randomSchedule()
