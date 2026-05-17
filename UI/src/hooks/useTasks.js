import { useEffect, useState } from 'react'
import { tasksAPI } from '../services/api'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tasksAPI.getAll().then(({ data }) => {
      setTasks(data)
      setLoading(false)
    })
  }, [])

  async function addTask(data) {
    const { data: task } = await tasksAPI.create(data)
    setTasks((prev) => [...prev, task])
    return task
  }

  async function updateTask(id, data) {
    const { data: updated } = await tasksAPI.update(id, data)
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  async function deleteTask(id) {
    await tasksAPI.delete(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return { tasks, loading, addTask, updateTask, deleteTask }
}
