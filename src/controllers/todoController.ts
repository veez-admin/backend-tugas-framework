
import { Request, Response } from 'express';
import { TodoModel } from '../models/todoModel.js';

// GET /api/todos — Ambil semua todo milik user
export const getTodos = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = res.locals.userId;

  try {
    const todos = await TodoModel.getByUserId(userId);
    res.status(200).json({ success: true, data: todos });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data.'
    });
  }
};

// GET /api/todos/:id — Ambil satu todo berdasarkan ID
export const getTodoById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = res.locals.userId;

  try {
    const todo = await TodoModel.getById(Number(id), userId);

    if (!todo) {
      res.status(404).json({
        success: false,
        message: 'Tugas tidak ditemukan!'
      });
      return;
    }

    res.status(200).json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data.'
    });
  }
};

// POST /api/todos — Tambah todo baru
export const createTodo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { task } = req.body;
  const userId = res.locals.userId;

  try {
    const newId = await TodoModel.create(userId, task);

    res.status(201).json({
      success: true,
      message: 'Tugas berhasil ditambahkan!',
      data: {
        id: newId,
        task,
        is_completed: false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan tugas.'
    });
  }
};

// PUT /api/todos/:id — Update todo
export const updateTodo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { task, is_completed } = req.body;
  const userId = res.locals.userId;

  try {
    // Ambil data lama agar field yang tidak dikirim tetap dipertahankan
    const existingTodo = await TodoModel.getById(Number(id), userId);

    if (!existingTodo) {
      res.status(404).json({
        success: false,
        message: 'Tugas tidak ditemukan!'
      });
      return;
    }

    const updatedTask =
      task !== undefined ? task : existingTodo.task;

    const updatedIsCompleted =
      is_completed !== undefined
        ? is_completed
        : Boolean(existingTodo.is_completed);

    const affectedRows = await TodoModel.update(
      Number(id),
      updatedTask,
      updatedIsCompleted,
      userId
    );

    // MySQL dapat mengembalikan 0 jika nilai tidak berubah
    // sehingga keberadaan todo sudah diperiksa sebelumnya.
    res.status(200).json({
      success: true,
      message: 'Tugas berhasil diperbarui!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui tugas.'
    });
  }
};

// DELETE /api/todos/:id — Hapus todo
export const deleteTodo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = res.locals.userId;

  try {
    const affectedRows = await TodoModel.delete(Number(id), userId);

    if (affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Tugas tidak ditemukan!'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Tugas berhasil dihapus!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus tugas.'
    });
  }
};
