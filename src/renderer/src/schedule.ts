import sectionsString from './assets/sectiosn.json?raw'
import { fixedTime, randomColor, randomElement, randomSubset } from './util'

class Course {
  constructor(
    public name: string,
    public color: string,
    public hours: number,
    public sections: Section[]
  ) {}
}

class Section {
  constructor(public meetings: Meeting[], public parentCourse: Course) {}
}

export class Meeting {
  constructor(
    public startTime: number,
    public endTime: number,
    public day: string,
    public parentSection: Section
  ) {}
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
  constructor(public days: Day[], public sections: Section[]) {}

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

  minimallyGapped(): boolean {
    const gaps = this.days.flatMap((day) => day.gaps())
    return gaps.every((gap) => gap <= 15)
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

// const scheduleFromSectionSet = (sections: Data['sections']): Schedule => {
//   const days: Record<string, Day> = {
//     M: new Day([]),
//     T: new Day([]),
//     W: new Day([]),
//     R: new Day([]),
//     F: new Day([])
//   }

//   sections.forEach((section) => {
//     section.meetings.forEach((meeting) => {
//       for (let i = 0; i < meeting.daysRaw.length; i++) {
//         days[meeting.daysRaw.charAt(i)].meetings.push(
//           new Meeting(
//             fixedTime(meeting.startTime),
//             fixedTime(meeting.endTime),
//             courses[`${section.subjectId} ${section.course}`]
//           )
//         )
//       }
//     })
//   })

//   const schedule = new Schedule(Object.values(days), Object.values(courses))

//   return schedule
// }

// export const randomSchedule = (): Schedule => {
//   const selectedSections: Data['sections'] = []

//   Object.keys(rawSections).forEach((sectionName) => {
//     if (Math.random() < 0.5) {
//       const sectionSet = rawSections[sectionName]
//       selectedSections.push(sectionSet[Math.floor(Math.random() * sectionSet.length)])
//     }
//   })

//   if (
//     selectedSections.length === 0 ||
//     selectedSections.map((section) => section.creditsMax).reduce((acc, x) => acc + x) != 18
//   )
//     return randomSchedule()

//   const schedule = scheduleFromSectionSet(selectedSections)

//   if (!schedule.valid()) {
//     return randomSchedule()
//   }

//   return schedule
// }

type SectionMap = Record<string, Data['sections']>

export const rawSections: SectionMap = JSON.parse(sectionsString)

export const courses: Course[] = []

for (const sectionName in rawSections) {
  const sections = rawSections[sectionName]
  const course = new Course(sectionName, randomColor(), sections[0].creditsMax, [])
  for (const rawSection of sections) {
    const section = new Section([], course)
    section.meetings.push(
      ...rawSection.meetings.flatMap((meeting) =>
        meeting.daysRaw
          .split('')
          .map(
            (day) =>
              new Meeting(fixedTime(meeting.startTime), fixedTime(meeting.endTime), day, section)
          )
      )
    )
    course.sections.push(section)
  }
  courses.push(course)
}

const scheduleFromSections = (sections: Section[]): Schedule => {
  const days: Record<string, Day> = {
    M: new Day([]),
    T: new Day([]),
    W: new Day([]),
    R: new Day([]),
    F: new Day([])
  }
  sections
    .flatMap((section) => section.meetings)
    .forEach((meeting) => {
      days[meeting.day].meetings.push(meeting)
    })
  return new Schedule(Object.values(days), [...sections])
}

const randomSchedule = (): Schedule => {
  let randomSections: Section[]
  do {
    randomSections = randomSubset(courses.map((course) => randomElement(course.sections)))
  } while (
    randomSections.length === 0 ||
    randomSections.map((section) => section.parentCourse.hours).reduce((acc, x) => acc + x) !== 18
  )
  return scheduleFromSections(randomSections)
}

console.log(randomSchedule())

export const allSchedules = Array(50000)
  .fill(0)
  .map(() => randomSchedule())
  .filter((schedule) => schedule.valid())
