import axios from 'axios'
import * as fs from 'fs/promises'
import { schedulePlannerUrl } from './secrets' // you have to create this manually.
import { shuffled } from './util'

type Data = {
  registrationBlocks: {
    id: string
    sectionIds: string[]
  }[]
  sections: {
    id: string
    subjectId: string
    course: string
    creditsMax: string
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

let sections: SectionMap = {}

export const loadKeys = (keys: string): void => {
  const split = keys.split('\n')
  headers = Object.assign(
    {},
    ...split.slice(1).map((line) => {
      const [key, value] = line.split(': ')
      return key === 'Content-Length' ? {} : { [key]: value } // this guy messes stuff up
    })
  )
}

let headers: Record<string, string> | undefined = undefined

export const grabSchedules = async (classes: string[]): Promise<SectionMap> => {
  try {
    const file = await fs.readFile('data.json')
    return JSON.parse(file.toString()) as SectionMap
  } catch (error) {
    sections = {}

    // const subjectsResponse = (
    //   await axios.get(
    //     '${schedulePlannerUrl}/subjects',
    //     { headers }
    //   )
    // ).data as { id: string; long: string }[]

    // fs.writeFile('subjects.json', JSON.stringify(subjectsResponse))

    // const courses: { subjectId: string; number: string; title: string }[] = []

    // for (const subject of subjectsResponse) {
    //   const coursesResponse (
    //     await axios.get(
    //       `${schedulePlannerUrl}/subjects/${subject.id}/courses`,
    //       { headers }
    //     )
    //   ).data as { subjectId: string; number: string; title: string }[]
    //   console.log(coursesResponse)
    //   courses.push(...coursesResponse)
    // }

    // fs.writeFile('courses.json', JSON.stringify(courses))

    const courses: { subjectId: string; number: string; title: string }[] = JSON.parse(
      (await fs.readFile('courses.json')).toString()
    )

    classes = []

    for (const course of shuffled(courses).slice(0, 200)) {
      try {
        const desireResponse = (
          await axios.post(
            `${schedulePlannerUrl}/desiredcourses`,
            {
              ...course
            },
            { headers }
          )
        ).data as { id: string }
        console.log(desireResponse)
        classes.push(desireResponse.id)
      } catch (error) {
        console.log(error)
      }
    }

    fs.writeFile('classes.json', JSON.stringify(classes))

    let i = 1

    for (const c of classes) {
      console.log(c + ` ${i++}/${classes.length}`)
      try {
        const data = (
          await axios.post(
            `${schedulePlannerUrl}/schedules/generate`,
            {
              breaks: [],
              cartSections: [],
              courses: [c],
              currentSections: [],
              padding: 0
            },
            {
              headers
            }
          )
        ).data as Data
        data.registrationBlocks.forEach((block) => {
          const subsections = block.sectionIds.map(
            (id) => data.sections.find((sec) => sec.id === id)!
          )
          const section: Data['sections'][number] = {
            id: 'whatever',
            course: subsections[0].course,
            subjectId: subsections[0].subjectId,
            creditsMax: subsections[0].creditsMax,
            meetings: subsections.flatMap((subs) => subs.meetings)
          }
          const key = `${section.subjectId} ${section.course}`
          if (sections[key] === undefined) sections[key] = []
          sections[key].push(section)
        })
      } catch (error) {
        console.log(error)
      }
    }
    fs.writeFile('data.json', JSON.stringify(sections))
    return sections
  }
}
