import { useEffect, useState } from 'react'
import { tasksAPI } from '../services/api'

function normTasks(tasks) {
  return tasks.map(t => ({
    ...t,
    bucket:        t.bucket === 'Immediate'        ? 'Karya' : t.bucket,
    origin_bucket: t.origin_bucket === 'Immediate' ? 'Karya' : t.origin_bucket,
  }))
}

export function useTasks() {
  const [tasks, setTasks]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [addedSinceBackup, setAddedSinceBackup] = useState(0)

  useEffect(() => {
    tasksAPI.getAll().then(({ data }) => {
      setTasks(normTasks(data))
      setLoading(false)
    })
  }, [])

  async function addTask(data) {
    const { data: task } = await tasksAPI.create(data)
    setTasks((prev) => [...prev, task])
    setAddedSinceBackup((n) => n + 1)
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

  async function deleteCompleted() {
    await tasksAPI.deleteCompleted()
    setTasks((prev) => prev.filter((t) => !t.completed))
  }

  // Bulk import: add tasks not already present by title
  async function importTasks(incoming) {
    const existingTitles = new Set(tasks.map(t => t.title.trim().toLowerCase()))
    const newOnes = incoming.filter(t => t.title && !existingTitles.has(t.title.trim().toLowerCase()))
    for (const t of newOnes) {
      await addTask({
        title:        t.title,
        bucket:       t.bucket || 'Karya',
        weightage:    t.weightage || null,
        time_horizon: t.time_horizon || t.timeHorizonType || null,
        life_area:    t.life_area || t.lifeArea || null,
        ch:           t.ch ? parseInt(t.ch) : null,
        multitask:    t.multitask ?? false,
      })
    }
    return newOnes.length
  }

  function resetBackupCounter() {
    setAddedSinceBackup(0)
  }

  return { tasks, loading, addTask, updateTask, deleteTask, deleteCompleted, importTasks, addedSinceBackup, resetBackupCounter }
}
