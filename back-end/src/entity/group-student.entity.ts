import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from "typeorm"
import { Group } from "./group.entity"
import { Student } from "./student.entity"

@Entity()
export class GroupStudent {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  student_id: number

  @Column()
  group_id: number

  @Column()
  incident_count: number

  public prepareToCreate(student: Student, group: Group) {
    this.student_id = student.id
    this.group_id = group.id
    this.incident_count = 0
  }

  public prepareToUpdate(student: Student, group: Group) {
    this.student_id = student.id
    this.group_id = group.id
    this.incident_count = 0
  }
}
