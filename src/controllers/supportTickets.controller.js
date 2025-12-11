import { SupportTickets } from "../models/supportTickets.model.js";

// إنشاء تذكرة جديدة
export const createTicket = async (req, res) => {
  try {
    const userId = req.user.user_id; // من التوكن
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: "الرجاء إدخال الموضوع والرسالة" });
    }

    await SupportTickets.createTicket(userId, subject, message);

    res.status(201).json({ message: "تم إنشاء التذكرة بنجاح" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "خطأ في إنشاء التذكرة" });
  }
};

// عرض التذاكر الخاصة بالمستخدم
export const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [tickets] = await SupportTickets.getUserTickets(userId);
    res.json(tickets);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "خطأ في عرض التذاكر" });
  }
};

// عرض كل التذاكر (لأدمن فقط)
export const getAllTickets = async (req, res) => {
  try {
    const [tickets] = await SupportTickets.getAllTickets();
    res.json(tickets);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "خطأ في جلب جميع التذاكر" });
  }
};

// تعديل حالة التذكرة
export const updateStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const allowed = ["open", "pending", "closed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "الحالة غير صحيحة" });
    }

    await SupportTickets.updateStatus(ticketId, status);
    res.json({ message: "تم تحديث حالة التذكرة" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "خطأ في تحديث الحالة" });
  }
};
