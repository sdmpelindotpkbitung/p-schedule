const db = require("../config/db");
// ⚠️ Pastikan baris di bawah ini mengarah ke file konfigurasi Supabase Anda
// (Sesuaikan path-nya jika file Anda berbeda, misalnya "../config/supabaseConfig")
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// PERUBAHAN 1: Menambahkan s.foto di selectFields agar frontend bisa membaca gambar
const selectFields = `
  s.id, s.foto, s.is_reminder, TO_CHAR(s.tanggal, 'YYYY-MM-DD') AS tanggal,
  TO_CHAR(s.jam_mulai, 'HH24:MI') AS jam_mulai,
  TO_CHAR(s.jam_selesai, 'HH24:MI') AS jam_selesai,
  s.agenda, s.keterangan, s.created_at, s.user_id,
  u.nama AS nama_penginput, u.division_id, d.nama AS division_name,
  s.room_id, r.nama AS nama_ruangan`;

const joins = `FROM schedules s JOIN users u ON s.user_id = u.id
  LEFT JOIN divisions d ON u.division_id = d.id JOIN rooms r ON s.room_id = r.id`;

const findConflict = async (
  roomId,
  tanggal,
  jamMulai,
  jamSelesai,
  excludeId = null
) => {
  let query = `SELECT s.*, u.nama AS nama_penginput, r.nama AS nama_ruangan
    FROM schedules s JOIN users u ON s.user_id = u.id JOIN rooms r ON s.room_id = r.id
    WHERE s.room_id = $1 AND s.tanggal = $2 AND s.jam_mulai < $3 AND s.jam_selesai > $4`;
  
  const params = [roomId, tanggal, jamSelesai, jamMulai];
  
  if (excludeId) {
    query += " AND s.id != $5";
    params.push(excludeId);
  }
  
  const { rows } = await db.query(query, params);
  return rows[0] || null;
};

const getAll = async (req, res) => {
  try {
    let where = "";
    const params = [];
    if (req.query.bulan) {
      where = "WHERE TO_CHAR(s.tanggal, 'YYYY-MM') = $1";
      params.push(req.query.bulan);
    } else if (req.query.tanggal) {
      where = "WHERE s.tanggal = $1";
      params.push(req.query.tanggal);
    }
    
    const { rows } = await db.query(
      `SELECT ${selectFields} ${joins} ${where} ORDER BY s.tanggal ASC, s.jam_mulai ASC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error("getAll schedules error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const getManaged = async (req, res) => {
  try {
    let where = "";
    const params = [];
    if (req.user.role === "staff") {
      where = "WHERE s.user_id = $1";
      params.push(req.user.id);
    } else if (req.user.role === "pic") {
      const { rows: requester } = await db.query(
        "SELECT division_id FROM users WHERE id = $1",
        [req.user.id]
      );
      where = "WHERE u.division_id = $1";
      params.push(requester[0]?.division_id || 0);
    }
    
    const { rows } = await db.query(
      `SELECT ${selectFields} ${joins} ${where} ORDER BY s.tanggal DESC, s.jam_mulai DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error("getManaged schedules error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const getById = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT ${selectFields} ${joins} WHERE s.id = $1`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: "Jadwal tidak ditemukan." });
    res.json(rows[0]);
  } catch (err) {
    console.error("getById schedule error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const validatePayload = ({
  room_id,
  tanggal,
  jam_mulai,
  jam_selesai,
  agenda,
}) => {
  if (!room_id || !tanggal || !jam_mulai || !jam_selesai || !agenda)
    return "Semua kolom wajib harus diisi.";
  if (jam_mulai >= jam_selesai)
    return "Jam selesai harus lebih besar dari jam mulai.";
  return null;
};

// PERUBAHAN 2: Fungsi CREATE disesuaikan untuk menangkap gambar (req.file)
const create = async (req, res) => {
  const error = validatePayload(req.body);
  if (error) return res.status(400).json({ message: error });
  
  // 👈 PASTIKAN is_reminder DITANGKAP DARI req.body
  const { room_id, tanggal, jam_mulai, jam_selesai, agenda, keterangan, is_reminder } = req.body;
  
  try {
    const conflict = await findConflict(room_id, tanggal, jam_mulai, jam_selesai);
    if (conflict)
      return res.status(409).json({ message: "Jadwal bentrok dengan jadwal yang sudah ada.", conflict });
      
    // ── Logika Upload Gambar ──
    let fotoUrl = null;
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `jadwal-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('jadwal_foto') 
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('jadwal_foto')
        .getPublicUrl(fileName);

      fotoUrl = publicUrlData.publicUrl;
    }
    // ────────────────────────

    // 👈 DEKLARASIKAN reminderFlag TEPAT SEBELUM QUERY INSERT
    const reminderFlag = is_reminder === 'true' || is_reminder === true;

    const { rows: result } = await db.query(
      `INSERT INTO schedules (user_id, room_id, tanggal, jam_mulai, jam_selesai, agenda, keterangan, foto, is_reminder) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        req.user.id,
        room_id,
        tanggal,
        jam_mulai,
        jam_selesai,
        agenda,
        keterangan || null,
        fotoUrl,
        reminderFlag // Parameter ke-9
      ]
    );
    res.status(201).json({ message: "Jadwal berhasil ditambahkan.", id: result[0].id });
  } catch (err) {
    console.error("create schedule error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const canManage = async (user, scheduleUserId) => {
  if (user.role === "big_admin") return true;
  if (user.role === "staff") return scheduleUserId === user.id;
  if (user.role === "pic") {
    const { rows: requester } = await db.query(
      "SELECT division_id FROM users WHERE id = $1",
      [user.id]
    );
    const { rows: owner } = await db.query(
      "SELECT division_id FROM users WHERE id = $1",
      [scheduleUserId]
    );
    return (
      requester.length > 0 &&
      owner.length > 0 &&
      requester[0].division_id !== null &&
      requester[0].division_id === owner[0].division_id
    );
  }
  return false;
};

// PERUBAHAN 3: Fungsi UPDATE disesuaikan untuk menangkap gambar (req.file) dan menghapus gambar
const update = async (req, res) => {
  const error = validatePayload(req.body);
  if (error) return res.status(400).json({ message: error });
  
  // 👈 PASTIKAN is_reminder DITANGKAP DARI req.body
  const { room_id, tanggal, jam_mulai, jam_selesai, agenda, keterangan, remove_foto, is_reminder } = req.body;
  
  try {
    const { rows: existing } = await db.query("SELECT * FROM schedules WHERE id = $1", [req.params.id]);
    if (!existing.length)
      return res.status(404).json({ message: "Jadwal tidak ditemukan." });
      
    if (!(await canManage(req.user, existing[0].user_id)))
      return res.status(403).json({ message: "Anda tidak memiliki izin untuk mengubah jadwal ini." });
      
    const conflict = await findConflict(
      room_id, tanggal, jam_mulai, jam_selesai, parseInt(req.params.id)
    );
    if (conflict)
      return res.status(409).json({ message: "Jadwal bentrok dengan jadwal yang sudah ada.", conflict });
      
    // ── Logika Update Gambar ──
    let fotoUrl = existing[0].foto; 

    if (req.file) { 
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `jadwal-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('jadwal_foto')
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('jadwal_foto')
        .getPublicUrl(fileName);

      fotoUrl = publicUrlData.publicUrl; 
    } else if (remove_foto === 'true') {
      fotoUrl = null; 
    }
    // ────────────────────────
      
    // 👈 DEKLARASIKAN reminderFlag TEPAT SEBELUM QUERY UPDATE
    const reminderFlag = is_reminder === 'true' || is_reminder === true;

    await db.query(
      `UPDATE schedules 
       SET room_id = $1, tanggal = $2, jam_mulai = $3, jam_selesai = $4, agenda = $5, keterangan = $6, foto = $7, is_reminder = $8 
       WHERE id = $9`,
      [
        room_id,
        tanggal,
        jam_mulai,
        jam_selesai,
        agenda,
        keterangan || null,
        fotoUrl,
        reminderFlag, // Parameter ke-8
        req.params.id // Parameter ke-9
      ]
    );
    res.json({ message: "Jadwal berhasil diperbarui." });
  } catch (err) {
    console.error("update schedule error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const remove = async (req, res) => {
  try {
    const { rows: existing } = await db.query("SELECT * FROM schedules WHERE id = $1", [
      req.params.id,
    ]);
    if (!existing.length)
      return res.status(404).json({ message: "Jadwal tidak ditemukan." });
      
    if (!(await canManage(req.user, existing[0].user_id)))
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk menghapus jadwal ini.",
      });
      
    await db.query("DELETE FROM schedules WHERE id = $1", [req.params.id]);
    res.json({ message: "Jadwal berhasil dihapus." });
  } catch (err) {
    console.error("delete schedule error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

module.exports = { getAll, getManaged, getById, create, update, remove };