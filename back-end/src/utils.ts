export function rollWhereCondition(rollStates: string): string {
  const rolls = rollStates.split(",")
  let condition = ""
  rolls.forEach((roll, index) => {
    condition += `student_roll_state.state = '${roll}'`
    condition += index === rolls.length - 1 ? "" : " OR "
  })
  return "(" + condition + ")"
}

export function dateWhereCondition(week: number): string {
  const date = new Date()
  date.setDate(date.getDate() - week * 7)
  return `roll.completed_at BETWEEN '${date.toISOString().split("T")[0]}' AND '${new Date().toISOString().split("T")[0]}'`
}
