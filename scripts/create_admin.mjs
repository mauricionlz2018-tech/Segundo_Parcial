import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer)
    })
  })
}

async function main() {
  try {
    console.log("\n=== Crear Nuevo Admin ===\n")

    const email = await question("Email: ")
    const username = await question("Username: ")
    const password = await question("Contraseña: ")
    const fullName = await question("Nombre completo: ")

    if (!email || !username || !password || !fullName) {
      console.log("❌ Todos los campos son requeridos")
      process.exit(1)
    }

    const pool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT ?? 3306),
      connectionLimit: 3,
    })

    const [existing] = await pool.execute("select id from users where email = ? or username = ? limit 1", [
      email,
      username,
    ])

    if (Array.isArray(existing) && existing.length > 0) {
      console.log("❌ El usuario ya existe con ese email o username")
      process.exit(1)
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const id = crypto.randomUUID()

    await pool.execute(
      "insert into users (id, email, username, full_name, role, password_hash) values (?, ?, ?, ?, ?, ?)",
      [id, email, username, fullName, "admin", passwordHash]
    )

    console.log("\n✅ Admin creado exitosamente!")
    console.log(`Email: ${email}`)
    console.log(`Username: ${username}`)
    console.log(`ID: ${id}\n`)

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error("❌ Error:", error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

main()
