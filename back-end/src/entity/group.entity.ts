import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { CreateGroupInput, UpdateGroupInput } from "../interface/group.interface"
import { GroupStudent } from "./group-student.entity"

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  number_of_weeks: number

  @Column()
  roll_states: string

  @Column()
  incidents: number

  @Column()
  ltmt: string

  @Column({
    default: () => "CURRENT_TIMESTAMP",
  })
  run_at: Date

  @Column({
    default: 0,
  })
  student_count: number

  public prepareToCreate(input: CreateGroupInput) {
    this.name = input.name
    this.number_of_weeks = input.number_of_weeks
    this.roll_states = input.roll_states
    this.incidents = input.incidents
    this.ltmt = input.ltmt
    this.student_count = input.student_count
  }
  public prepareToUpdate(input: UpdateGroupInput) {
    if (this.name !== undefined) this.name = input.name
    if (this.number_of_weeks !== undefined) this.number_of_weeks = input.number_of_weeks
    if (this.roll_states !== undefined) this.roll_states = input.roll_states
    if (this.incidents !== undefined) this.incidents = input.incidents
    if (this.ltmt !== undefined) this.ltmt = input.ltmt
    if (this.student_count !== undefined) this.student_count = input.student_count
  }
}
