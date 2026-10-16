const readline = require("readline");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config();

const ask = (question) => {
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    terminal.question(question, (answer) => {
      terminal.close();
      resolve(answer.trim());
    });
  });
};

const askHidden = (question) => {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return Promise.reject(
      new Error("Password harus dimasukkan dari terminal interaktif."),
    );
  }

  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    let answer = "";
    let finished = false;
    const renderPrompt = () => {
      process.stdout.write(`\r\x1b[K${question} [${answer.length} karakter]: `);
    };

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      process.stdout.write("\n");
    };

    const finish = (value) => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(value);
    };

    const onData = (chunk) => {
      for (const character of chunk.toString()) {
        if (character === "\u0003") {
          cleanup();
          reject(new Error("Proses dibatalkan."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish(answer);
          return;
        }
        if (character === "\u0008" || character === "\u007f") {
          answer = answer.slice(0, -1);
          renderPrompt();
          continue;
        }
        if (character >= " ") {
          answer += character;
          renderPrompt();
        }
      }
    };

    renderPrompt();
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    stdin.on("data", onData);
  });
};

const createPool = () =>
  mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tpk_scheduler",
    waitForConnections: true,
    connectionLimit: 1,
  });

const main = async () => {
  const username = await ask("Username Big Admin: ");
  const password = await askHidden("Password baru (tidak akan ditampilkan): ");

  if (!username) throw new Error("Username wajib diisi.");
  if (password.length < 6) {
    throw new Error("Password minimal 6 karakter.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const pool = createPool();

  try {
    const [existing] = await pool.query(
      "SELECT id, role FROM users WHERE username = ?",
      [username],
    );
    const [admins] = await pool.query(
      "SELECT id FROM users WHERE role = 'big_admin'",
    );
    const isExistingBigAdmin =
      existing.length > 0 && existing[0].role === "big_admin";

    if (
      admins.length > 1 ||
      (admins.length === 1 &&
        (!isExistingBigAdmin || admins[0].id !== existing[0].id))
    ) {
      throw new Error(
        "Big Admin sudah ada; akun Big Admin kedua tidak dapat dibuat.",
      );
    }

    if (existing.length > 0) {
      await pool.query(
        "UPDATE users SET password = ?, role = 'big_admin', division_id = NULL WHERE id = ?",
        [passwordHash, existing[0].id],
      );
      console.log(`Akun Big Admin '${username}' berhasil dipulihkan.`);
    } else {
      const [result] = await pool.query(
        "INSERT INTO users (nama, username, password, role, division_id) VALUES (?, ?, ?, 'big_admin', NULL)",
        ["Administrator", username, passwordHash],
      );
      console.log(
        `Akun Big Admin '${username}' berhasil dibuat (ID: ${result.insertId}).`,
      );
    }
  } finally {
    await pool.end();
  }
};

main().catch((error) => {
  console.error(`Gagal memulihkan Big Admin: ${error.message}`);
  process.exitCode = 1;
});
