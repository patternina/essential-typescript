import { TodoItem } from './todoItem'
import { TodoCollection } from './todoCollection'
import * as lowdb from 'lowdb'
import * as FileSync from 'lowdb/adapters/FileSync'

type schemaType = {
  tasks: {
    id: number
    task: string
    complete: boolean
  }[]
}

export class JsonTodoCollection extends TodoCollection {
  private database: lowdb.LowdbSync<schemaType>

  constructor(public userName: string, todoItems: TodoItem[] = []) {
    super(userName, [])
    this.database = lowdb(new FileSync('Todos.json'))

    if (this.database.has('tasks').value()) {
      let dbItems = this.database.get('tasks').value()
      dbItems.forEach((dbItem) => {
        this.itemMap.set(
          dbItem.id,
          new TodoItem(dbItem.id, dbItem.task, dbItem.complete)
        )
      })
    } else {
      this.database.set('tasks', todoItems).write()
      todoItems.forEach((item) => {
        this.itemMap.set(item.id, item)
      })
    }
  }

  addTodo(task: string): number {
    let result = super.addTodo(task)
    this.storeTasks()

    return result
  }

  markComplete(id: number, complete: boolean): void {
    super.markComplete(id, complete)
    this.storeTasks()
  }

  removeCompleteTodo(): void {
    super.removeCompleteTodo()
    this.storeTasks()
  }

  private storeTasks() {
    this.database.set('tasks', [...this.itemMap.values()]).write()
  }
}
