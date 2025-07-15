import { db } from '@/utils/db'
import type { NextApiRequest, NextApiResponse } from 'next'

// type Todo = {
//   id: number
//   text: string
//   completed: boolean
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET': {
      const { rows } = await db.query('SELECT * FROM todo ORDER BY id DESC')
      res.status(200).json(rows)
      break
    }

    case 'POST': {
      const { text } = req.body
      const insert = await db.query(
        'INSERT INTO todo (text, completed) VALUES ($1, $2) RETURNING *',
        [text, false]
      )
      res.status(201).json(insert.rows[0])
      break
    }

    case 'PUT': {
      const { id, completed, text } = req.body
      try {
        if (text !== undefined) {
          await db.query('UPDATE todo SET text = $1 WHERE id = $2', [text, id])
        }
        if (completed !== undefined) {
          await db.query('UPDATE todo SET completed = $1 WHERE id = $2', [completed, id])
        }
        res.status(200).json({ message: 'Todo berhasil diupdate' })
      } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Gagal update todo' })
      }
      break
    }

    case 'DELETE': {
      const { deleteId } = req.body
      await db.query('DELETE FROM todo WHERE id = $1', [deleteId])
      res.status(200).json({ message: 'Todo berhasil dihapus' })
      break
    }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
