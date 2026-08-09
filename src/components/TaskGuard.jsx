import React from 'react'
import { useTask } from '../TaskContext'
import { useTaskGuard } from '../hooks/useTaskGuard'
import TaskExitWarning from './TaskExitWarning'

/**
 * TaskGuard — must live INSIDE <TaskProvider>.
 *
 * Activates the anti-cheat guard whenever a task session is active.
 * Renders the TaskExitWarning modal when the student has been caught leaving.
 */
export default function TaskGuard() {
  const { activeSession, resetTaskSession, exitWarning, clearExitWarning } = useTask()

  // Attach visibility / app-state listeners while a task is in progress
  useTaskGuard({ activeSession, resetTaskSession })

  if (!exitWarning) return null
  return <TaskExitWarning onDismiss={clearExitWarning} />
}
