import { db } from '@/utils/db'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'

type Todo = {
  id: number
  text: string
  completed: boolean
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET': {
      const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM todo')
      const todos = rows as Todo[]
      res.status(200).json(todos)
      break
    }

    case 'POST': {
      const { text } = req.body
      const [result] = await db.query<ResultSetHeader>(
        'INSERT INTO todo (text) VALUES (?)',
        [text]
      )
      const insertId = result.insertId

      const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM todo WHERE id = ?',
        [insertId]
      )
      const newTodo = rows[0] as Todo
      res.status(201).json(newTodo)
      break
    }

    case 'PUT': {
      const { id, completed, text } = req.body
      try {
        if (text !== undefined) {
        await db.query('UPDATE todo SET text = ? WHERE id = ?', [text, id])
        }
        if (completed !== undefined) {
        await db.query('UPDATE todo SET completed = ? WHERE id = ?', [completed, id])
        }
        res.status(200).json({message: "Todo berhasil di update"})
      } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Gagal update todo' })
      }
      break
    }

    case 'DELETE': {
      const { deleteId } = req.body
      await db.query('DELETE FROM todo WHERE id = ?', [deleteId])
      res.status(200).json({ message: 'Todo deleted' })
      break
    }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
