import { getRepository } from "typeorm"
import { NextFunction, Request, Response } from "express"
import { Group } from "../entity/group.entity"
import { GroupStudent } from "../entity/group-student.entity"
import { CreateGroupInput, UpdateGroupInput } from "../interface/group.interface"
import { StudentRollState } from "../entity/student-roll-state.entity"
import { Roll } from "../entity/roll.entity"
import { dateWhereCondition, rollWhereCondition } from "../utils"
import { Student } from "../entity/student.entity"

export class GroupController {
  private groupRepository = getRepository(Group)
  private groupStudentRepository = getRepository(GroupStudent)
  private studentRollStateRepository = getRepository(StudentRollState)
  private studentRepository = getRepository(Student)

  async allGroups(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Return the list of all groups
    const groups = this.groupRepository.find()
    return groups
  }

  async createGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Add a Group
    const { body: params } = request
    const createGroupInput: CreateGroupInput = {
      name: params.name,
      number_of_weeks: params.number_of_weeks,
      roll_states: params.roll_states,
      incidents: params.incidents,
      ltmt: params.ltmt,
      run_at: new Date(),
    }
    const group = new Group()
    group.prepareToCreate(createGroupInput)
    const groupCreated = this.groupRepository.save(group)
    return groupCreated
  }

  async updateGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Update a Group
    const { body: params } = request
    const updateGroupInput: UpdateGroupInput = {
      name: params.name,
      number_of_weeks: params.number_of_weeks,
      roll_states: params.roll_states,
      incidents: params.incidents,
      ltmt: params.ltmt,
      student_count: params.student_count,
    }
    const group = await this.groupRepository.findOne(params.id)
    if (group === undefined) {
      return response.status(400).json({ message: "Group not found" })
    }
    group.prepareToUpdate(updateGroupInput)
    const groupUpdated = this.groupRepository.save(group)
    return groupUpdated
  }

  async removeGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Delete a Group
    const { id } = request.query
    console.log(request.query)
    if (id === undefined) {
      return response.status(400).json({ message: "Group id is required" })
    }
    const groupToRemove = await this.groupRepository.findOne(id)
    const groupRemoved = await this.groupRepository.remove(groupToRemove)
    return groupRemoved
  }

  async updateGroupStudent(groupId: number, result) {
    result.forEach(async (student) => {
      console.log("student", student)
      const groupStudent = new GroupStudent()
      groupStudent.group_id = groupId
      groupStudent.student_id = student.student_id
      groupStudent.incident_count = student.incident_count
      await this.groupStudentRepository.save(groupStudent)
    })
  }

  async updateGroupMetaData(groupId: number, result) {
    const group = await this.groupRepository.findOne(groupId)
    group.student_count = result.length
    group.run_at = new Date()
    await this.groupRepository.save(group)
  }

  async getGroupStudents(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Return the list of Students that are in a Group

    const { id } = request.query
    if (id === undefined) {
      return response.status(400).json({ message: "Group id is required" })
    }

    const students = await this.studentRepository
      .createQueryBuilder("student")
      .innerJoin(GroupStudent, "group_student", "student.id = group_student.student_id")
      .where("group_student.group_id = :id", { id })
      .getRawMany()

    return students
  }

  async runGroupFilters(request: Request, response: Response, next: NextFunction) {
    // Task 2:
    // 1. Clear out the groups (delete all the students from the groups)
    await this.groupStudentRepository.clear()
    // 2. For each group, query the student rolls to see which students match the filter for the group
    /* Filter */
    /* 
      1. number of weeks 2
      2. roll states ["early", "late"]
      3. incidents 3
      4 ltmt > 3
    */
    const groups = await this.groupRepository.find()
    groups.forEach(async (group) => {
      const rollCondition = rollWhereCondition(group.roll_states)
      const dateCondition = dateWhereCondition(group.number_of_weeks)
      //const lastWeek = getLastWeekDate(group.number_of_weeks)
      const result = await this.studentRollStateRepository
        .createQueryBuilder("student_roll_state")
        .select("student_id")
        .addSelect("COUNT(student_roll_state.student_id) AS incident_count")
        .innerJoin(Roll, "roll", "roll.id = student_roll_state.roll_id")
        .where(rollCondition)
        .andWhere(dateCondition)
        .groupBy("student_roll_state.student_id")
        .having(`incident_count ${group.ltmt} :incidents`, { incidents: group.incidents })
        .getRawMany()
      console.log(result)

      // 3. Add the list of students that match the filter to the group
      await this.updateGroupStudent(group.id, result)
      await this.updateGroupMetaData(group.id, result)
    })
    return "Success"
  }
}
