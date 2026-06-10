import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const email = "admin.ues"
const password = "Admin2025!"
const username = "admin.ues"
const fullName = "Administrador UES"
const role = "admin"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const { data: existing } = await supabase
  .from("users")
  .select("id")
  .or(`email.eq.${email},username.eq.${username}`)
  .limit(1)
  .single()

if (existing) {
  console.log("Admin user already exists.")
  process.exit(0)
}

const passwordHash = await bcrypt.hash(password, 10)

const { data, error } = await supabase
  .from("users")
  .insert({ email, username, full_name: fullName, role, password_hash: passwordHash })
  .select("id")
  .single()

if (error) {
  console.error("Error al crear admin:", error.message)
  process.exit(1)
}

console.log("Admin user created:", username, "id:", data.id)
process.exit(0)
