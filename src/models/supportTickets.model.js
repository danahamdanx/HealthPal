import { db } from "../config/db.js";

export const SupportTickets = {
  createTicket: (userId, subject, message) => {
    const sql = `
      INSERT INTO support_tickets (user_id, subject, message)
      VALUES (?, ?, ?)
    `;
    return db.execute(sql, [userId, subject, message]);
  },

  getUserTickets: (userId) => {
    const sql = `
      SELECT * FROM support_tickets
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    return db.execute(sql, [userId]);
  },

  getAllTickets: () => {
    const sql = `SELECT * FROM support_tickets ORDER BY created_at DESC`;
    return db.execute(sql);
  },

  updateStatus: (ticketId, status) => {
    const sql = `
      UPDATE support_tickets
      SET status = ?
      WHERE ticket_id = ?
    `;
    return db.execute(sql, [status, ticketId]);
  }
};
