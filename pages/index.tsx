import { useEffect, useState } from 'react'

type Todo = {
  id: number
  text: string
  completed: boolean
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [text, setText] = useState('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editedText, setEditedText] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    const res = await fetch('/api/todolist')
    const data = await res.json()
    setTodos(data)
  } 

  const handleAddTodo = async () => {
    if (!text) return

    const res = await fetch('/api/todolist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    const newTodo = await res.json()
    setTodos((prev) => [...prev, newTodo])
    setText('')
  }

  const toggleTodo = async (id: number, completed: boolean, text?: string) => {
    await fetch('/api/todolist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed, text }),
    })

    setTodos((prev) =>
    prev.map((todo) =>
      todo.id === id
      ? { ...todo, completed, ...(text !== undefined ? {text} : {}) } : todo
    )
  )
  }

  const deleteTodo =async (id: number) => {
    await fetch('/api/todolist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deleteId: id }),
    })
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">📋 Daftar Todo</h1>

      <div className="flex mb-4 space-x-2">
        <input
          type="text"
          className="border px-4 py-2 w-full"
          placeholder="Tulis todo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={handleAddTodo}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Tambah
        </button>
      </div>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex justify-between items-center border p-2 rounded"
          >
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!todo.completed}
              onChange={() => toggleTodo(todo.id, !todo.completed)}
            />

            {editingId === todo.id ? (
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="border px-2 py-1 text-sm"
              />
            ) : (
              <span
                className={todo.completed ? 'line-through text-gray-400' : ''}
              >
                {todo.text}
              </span>
            )}
          </label>

          {editingId === todo.id ? (
            <button
              onClick={() => {
                toggleTodo(todo.id, todo.completed, editedText)
                setEditingId(null)
                setEditedText('')
              }}
              className="text-green-500 hover:underline text-sm"
            >
              Simpan
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingId(todo.id)
                setEditedText(todo.text)
              }}
              className="text-blue-500 hover:underline text-sm"
            >
              Edit
            </button>
          )}
          <button onClick={() => deleteTodo(todo.id)}
            className="text-red-600 hover:underline text-sm"
          >
            Hapus
          </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
