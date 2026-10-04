import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-lg px-3 py-2 border border-gray-200 bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";
const labelClass = "block text-sm font-medium mb-1";

export default function Profile() {
  const { updateUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    createdAt: "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/users/profile")
      .then((res) => {
        if (!active) return;
        const profile = res.data.data;
        setForm((current) => ({
          ...current,
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          role: profile.role || "",
          createdAt: profile.createdAt || "",
        }));
      })
      .catch(() => {
        if (active) setError("Unable to load your profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
      };

      if (form.currentPassword || form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await api.put("/users/profile", payload);
      updateUser(res.data.data);
      setForm((current) => ({
        ...current,
        ...res.data.data,
        currentPassword: "",
        newPassword: "",
      }));
      setSuccess("Profile saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-8">
        <div className="h-8 w-40 rounded skeleton mb-4" />
        <div className="h-64 rounded-lg skeleton" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto p-6 sm:p-8"
    >
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>
        My Profile
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
        {form.role ? `${form.role} account` : "Account"}
        {form.createdAt ? ` · joined ${new Date(form.createdAt).toLocaleDateString()}` : ""}
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg shadow-sm p-6 space-y-4"
        style={{ background: "var(--color-surface)" }}
      >
        {error && (
          <p
            className="text-sm p-2 rounded"
            style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}
          >
            {error}
          </p>
        )}
        {success && (
          <p
            className="text-sm p-2 rounded"
            style={{ background: "var(--color-accent-light)", color: "var(--color-accent)" }}
          >
            {success}
          </p>
        )}

        <div>
          <label className={labelClass}>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} required className={inputClass} />
        </div>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm font-medium mb-3">Change password</p>
          <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
            Leave these blank if you only want to update your name, email, or phone.
          </p>
          <div className="space-y-3">
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Current password"
              className={inputClass}
            />
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="New password"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60"
          style={{ background: "var(--color-primary)" }}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </motion.div>
  );
}
