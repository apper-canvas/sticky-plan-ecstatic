import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, addWeeks, addMonths, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, getDay, getDate, isSameMonth } from 'date-fns'
import { toast } from 'react-toastify'
import { useDndMonitor, DndContext, DragOverlay, useDroppable, useDraggable } from '@dnd-kit/core'
import getIcon from '../utils/iconUtils'

// Icons
const PlusIcon = getIcon('Plus')
const EditIcon = getIcon('Edit')
const TrashIcon = getIcon('Trash')
const XIcon = getIcon('X')
const CheckIcon = getIcon('Check')
const ChevronLeftIcon = getIcon('ChevronLeft')
const ChevronRightIcon = getIcon('ChevronRight')
const StickyNoteIcon = getIcon('StickyNote')
const ClockIcon = getIcon('Clock')
const CalendarDaysIcon = getIcon('CalendarDays')
const CalendarRangeIcon = getIcon('CalendarRange')
const CalendarIcon = getIcon('Calendar')

// Color options for sticky notes
const COLORS = [
  { id: 'yellow', value: 'note-yellow', bgClass: 'bg-note-yellow' },
  { id: 'blue', value: 'note-blue', bgClass: 'bg-note-blue' },
  { id: 'green', value: 'note-green', bgClass: 'bg-note-green' },
  { id: 'pink', value: 'note-pink', bgClass: 'bg-note-pink' },
  { id: 'purple', value: 'note-purple', bgClass: 'bg-note-purple' },
]

// Time slots for the day
const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => i + 7) // 7AM to 6PM

// Generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// Draggable Sticky Note Component
function StickyNote({ task, onEdit, onDelete, isOverlay = false }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled: isOverlay
  })

  const colorClass = `bg-${task.colorCode}`
  
  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ 
        opacity: isDragging ? 0.5 : 1, 
        touchAction: 'none',
      }}
      className={`sticky-note ${colorClass} select-none`}
      whileHover={{ scale: isOverlay ? 1 : 1.02 }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-surface-800 break-words line-clamp-1">{task.title}</h4>
        {!isOverlay && (
          <div className="flex gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task)
              }}
              className="p-1 text-surface-600 hover:text-surface-800 transition-colors"
            >
              <EditIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onDelete(task.id)
              }}
              className="p-1 text-surface-600 hover:text-primary transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-surface-700 break-words line-clamp-2">
        {task.description}
      </p>
    </motion.div>
  )
}

// Droppable Time Slot Component
function TimeSlot({ hour, date, tasks, isActive }) {
  const { setNodeRef } = useDroppable({
    id: `${format(date, 'yyyy-MM-dd')}-${hour}`,
    data: { hour, date }
  })
  
  const formattedHour = hour < 12 
    ? `${hour} AM` 
    : hour === 12 
      ? '12 PM' 
      : `${hour - 12} PM`

  return (
    <div className={`flex border-b border-r border-surface-200 dark:border-surface-700 ${isActive ? 'bg-surface-100/50 dark:bg-surface-800/50' : ''}`}>
      {/* Time indicator on left */}
      <div className="hidden sm:flex w-20 min-w-[5rem] items-center justify-center border-r border-surface-200 dark:border-surface-700 py-2 text-sm text-surface-500">
        {formattedHour}
      </div>
      
      {/* Droppable area */}
      <div 
        ref={setNodeRef}
        className="flex-1 min-h-[100px] p-2 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
      >
        <AnimatePresence>
          {tasks.map(task => (
            <StickyNote 
              key={task.id} 
              task={task} 
              onEdit={(task) => {}} 
              onDelete={() => {}} 
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Task Form Component
function TaskForm({ onSubmit, onCancel, initialTask = null }) {
  const [title, setTitle] = useState(initialTask?.title || '')
  const [description, setDescription] = useState(initialTask?.description || '')
  const [colorCode, setColorCode] = useState(initialTask?.colorCode || COLORS[0].value)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Title cannot be empty")
      return
    }
    
    onSubmit({
      id: initialTask?.id || generateId(),
      title,
      description,
      colorCode,
      date: initialTask?.date || new Date(),
      timeSlot: initialTask?.timeSlot || 9, // Default to 9 AM
    })
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block mb-1 font-medium text-surface-700 dark:text-surface-300">
          Task Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-surface-800 dark:text-white transition-colors"
          placeholder="Enter task title"
          autoFocus
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block mb-1 font-medium text-surface-700 dark:text-surface-300">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-surface-800 dark:text-white transition-colors"
          placeholder="Enter task description"
          rows={3}
        />
      </div>
      
      <div>
        <label className="block mb-2 font-medium text-surface-700 dark:text-surface-300">
          Sticky Note Color
        </label>
        <div className="flex gap-3 flex-wrap">
          {COLORS.map(color => (
            <button
              key={color.id}
              type="button"
              className={`h-8 w-8 rounded-full ${color.bgClass} focus:ring-2 focus:ring-offset-2 focus:ring-primary ${colorCode === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
              onClick={() => setColorCode(color.value)}
              aria-label={`Select ${color.id} color`}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <CheckIcon className="h-4 w-4" />
          {initialTask ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  )
}

// Modal Component
function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-lg w-full max-w-md z-10 relative"
            >
              <div className="flex justify-between items-center p-4 border-b border-surface-200 dark:border-surface-700">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

// View Selector Component
function ViewSelector({ currentView, onViewChange }) {
  const views = [
    { id: 'daily', label: 'Day', icon: ClockIcon },
    { id: 'weekly', label: 'Week', icon: CalendarDaysIcon },
    { id: 'monthly', label: 'Month', icon: CalendarRangeIcon }
  ]
  
  return (
    <div className="view-selector bg-white dark:bg-surface-800 shadow-sm p-1 rounded-lg flex">
      {views.map(view => {
        const Icon = view.icon
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`px-3 py-2 rounded-md flex items-center gap-1 transition-colors ${
              currentView === view.id 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{view.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// Daily View Component
function DailyView({ currentDate, tasks, handleDragStart, handleDragEnd }) {
  // Filter tasks for the current day
  const tasksForDay = tasks.filter(task => 
    isSameDay(new Date(task.date), currentDate)
  )
  
  // Group tasks by time slot
  const getTasksByHour = (hour) => {
    return tasksForDay.filter(task => task.timeSlot === hour)
  }
  
  return (
    <div className="h-full overflow-y-auto">
      {TIME_SLOTS.map(hour => (
        <TimeSlot
          key={hour}
          hour={hour}
          date={currentDate}
          tasks={getTasksByHour(hour)}
          isActive={new Date().getHours() === hour && isSameDay(new Date(), currentDate)}
        />
      ))}
    </div>
  )
}

// Weekly View Component
function WeeklyView({ startDate, tasks, handleDragStart, handleDragEnd }) {
  // Calculate the days of the week
  const endDate = endOfWeek(startDate)
  const daysOfWeek = eachDayOfInterval({ start: startDate, end: endDate })
  
  // Helper to get tasks for a specific day and hour
  const getTasksByDayAndHour = (day, hour) => {
    return tasks.filter(task => 
      isSameDay(new Date(task.date), day) && task.timeSlot === hour
    )
  }
  
  return (
    <div className="h-full overflow-y-auto">
      {/* Header row with days */}
      <div className="flex border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800">
        <div className="w-20 min-w-[5rem] border-r border-surface-200 dark:border-surface-700"></div>
        {daysOfWeek.map((day, index) => (
          <div 
            key={index} 
            className={`flex-1 text-center py-2 font-medium ${
              isSameDay(day, new Date()) ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <div className="text-sm">{format(day, 'EEE')}</div>
            <div className={`text-lg ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      {/* Time slots */}
      {TIME_SLOTS.map(hour => (
        <div key={hour} className="flex border-b border-surface-200 dark:border-surface-700">
          <div className="w-20 min-w-[5rem] flex items-center justify-center border-r border-surface-200 dark:border-surface-700 py-2 text-sm text-surface-500">
            {hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
          </div>
          
          {daysOfWeek.map((day, index) => {
            const isActive = new Date().getHours() === hour && isSameDay(day, new Date());
            const cellId = `${format(day, 'yyyy-MM-dd')}-${hour}`;
            const { setNodeRef } = useDroppable({
              id: cellId,
              data: { hour, date: day }
            });
            
            return (
              <div 
                key={index}
                ref={setNodeRef}
                className={`flex-1 min-h-[100px] p-2 border-r border-surface-200 dark:border-surface-700 ${
                  isActive ? 'bg-surface-100/50 dark:bg-surface-800/50' : ''
                }`}
              >
                <AnimatePresence>
                  {getTasksByDayAndHour(day, hour).map(task => (
                    <StickyNote 
                      key={task.id} 
                      task={task} 
                      onEdit={() => {}} 
                      onDelete={() => {}} 
                    />
                  ))}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Main Feature Component
function MainFeature() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('sticky-tasks')
    return savedTasks ? JSON.parse(savedTasks) : []
  })
  const [activeTask, setActiveTask] = useState(null)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedTask, setDraggedTask] = useState(null)
  const [viewType, setViewType] = useState('daily')
  
  // Save tasks to localStorage when they change
  useEffect(() => {
    localStorage.setItem('sticky-tasks', JSON.stringify(tasks))
  }, [tasks])
  
  // Add a new task
  const handleAddTask = (newTask) => {
    setTasks([...tasks, newTask])
    setIsAddTaskModalOpen(false)
    toast.success("Task added successfully!")
  }
  
  // Edit a task
  const handleEditTask = (updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ))
    setIsEditTaskModalOpen(false)
    toast.success("Task updated successfully!")
  }
  
  // Delete a task
  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId))
    toast.success("Task deleted successfully!")
  }
  
  // Handle drag start
  const handleDragStart = (event) => {
    setIsDragging(true)
    setDraggedTask(event.active.data.current.task)
  }
  
  // Handle drag end
  const handleDragEnd = (event) => {
    setIsDragging(false)
    setDraggedTask(null)
    
    // Check if dropped on a droppable
    if (event.over) {
      const { hour, date } = event.over.data.current
      const updatedTask = {
        ...event.active.data.current.task,
        timeSlot: hour,
        date
      }
      
      setTasks(tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ))
      
      toast.success("Task moved successfully!")
    }
  }
  
  // Handle view change
  const handleViewChange = (newView) => {
    setViewType(newView)
  }
  
  // Calculate date range based on view type
  const getDateRange = () => {
    switch(viewType) {
      case 'weekly':
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        }
      case 'monthly':
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        }
      case 'daily':
      default:
        return {
          start: currentDate,
          end: currentDate
        }
    }
  }
  
  // Navigation based on view type
  const goToNext = () => {
    switch(viewType) {
      case 'monthly':
        setCurrentDate(addMonths(currentDate, 1))
        break
      case 'weekly':
        setCurrentDate(addWeeks(currentDate, 1))
        break
      case 'daily':
      default:
        setCurrentDate(addDays(currentDate, 1))
    }
  }
  
  const goToPrev = () => {
    switch(viewType) {
      case 'monthly':
        setCurrentDate(addMonths(currentDate, -1))
        break
      case 'weekly':
        setCurrentDate(addWeeks(currentDate, -1))
        break
      case 'daily':
      default:
        setCurrentDate(addDays(currentDate, -1))
    }
  }
  
  const goToToday = () => setCurrentDate(new Date())
  
  return (
    <div className="flex flex-col h-full">
      {/* Date navigation and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          {/* Previous button */}
          <button 
            onClick={goToPrev}
            className="p-2 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <div className="flex items-center bg-white dark:bg-surface-800 shadow-sm px-4 py-2 rounded-xl">
            <CalendarIcon className="h-5 w-5 mr-2 text-primary" /> 
            <h2 className="text-lg font-semibold">
              {viewType === 'daily' && format(currentDate, 'EEEE, MMMM d, yyyy')}
              {viewType === 'weekly' && `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`}
              {viewType === 'monthly' && format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
          
          {/* Next button */}
          <button 
            onClick={goToNext}
            className="p-2 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            aria-label="Next period"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex gap-2">
          {/* View selector */}
          <ViewSelector 
            currentView={viewType}
            onViewChange={handleViewChange}
          />
          
          {/* Today button */}
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white dark:bg-surface-800 shadow-sm rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
          >
            Today
          </button>

          {/* Add task button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddTaskModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-sm transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Task
          </motion.button>
        </div>
      </div>
      
      {/* Schedule grid */}
      <div className="flex-1 bg-white dark:bg-surface-800 rounded-xl shadow-sm overflow-hidden">
        <DndContext
          onDragStart={handleDragStart}
          {/* Calendar views */}
          <div className="h-full">
            {viewType === 'daily' && (
              <DailyView 
                currentDate={currentDate}
                tasks={tasks}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
              />
            )}
            {viewType === 'weekly' && (
              <WeeklyView
                startDate={startOfWeek(currentDate)}
                tasks={tasks}
              />
            )}
              />
            ))}
          </div>
          
          {/* Drag overlay */}
          {isDragging && draggedTask && (
            <DragOverlay>
              <StickyNote task={draggedTask} isOverlay={true} />
            </DragOverlay>
          )}
        </DndContext>
      </div>
      
      {/* Empty state */}
      {tasks.filter(task => isSameDay(new Date(task.date), currentDate)).length === 0 && viewType === 'daily' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-surface-800 rounded-xl p-6 text-center max-w-sm">
            <StickyNoteIcon className="h-14 w-14 mx-auto mb-4 text-surface-400" />
            <h3 className="text-xl font-semibold mb-2">No Tasks Yet</h3>
            <p className="text-surface-600 dark:text-surface-400 mb-4">
              Add a new task to get started with your day's planning.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddTaskModalOpen(true)}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-sm transition-colors flex items-center mx-auto pointer-events-auto"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Add Task
            </motion.button>
          </div>
        </div>
      )}
      
      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Add New Task"
      >
        <TaskForm 
          onSubmit={handleAddTask} 
          onCancel={() => setIsAddTaskModalOpen(false)}
        />
      </Modal>
      
      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditTaskModalOpen}
        onClose={() => setIsEditTaskModalOpen(false)}
        title="Edit Task"
      >
        <TaskForm 
          initialTask={activeTask}
          onSubmit={handleEditTask} 
          onCancel={() => setIsEditTaskModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default MainFeature