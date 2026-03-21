import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api";
import AlertMessage from "../../components/AlertMessage";
import { Eye, EyeOff } from "lucide-react";

export default function Profile() {
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // UPDATE PROFILE
  const updateProfile = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const res = await api.put("/auth/profile", { name, email });
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan");
    }
  };

  // CHANGE PASSWORD
  const changePassword = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const res = await api.put("/auth/change-password", {
        oldPassword,
        newPassword,
        confirmPassword
      });

      setSuccess(res.data.message);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan");
    }
  };

  return (
    <div className="md:bg-white md:shadow-2xl rounded-2xl md:p-8">

      {/* ALERT */}
      {success && (
        <AlertMessage
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      {error && (
        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      )}

      {/* HEADER */}
      <div className="flex items-center gap-5 md:border-b md:border-gray-100 pb-6 mb-6">
        <div className="w-16 h-16 bg-yellow-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
          {user?.name?.substring(0, 2).toUpperCase()}
        </div>

        <div>
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">
            {user?.name}
          </h1>
          <p className="text-sm text-gray-500 font-semibold">
            {user?.email}
          </p>
          <span className="inline-block mt-2 px-3 py-1 text-[10px] font-black uppercase rounded-lg bg-yellow-100 text-yellow-700">
            {user?.role}
          </span>
        </div>
      </div>

      {/* UPDATE PROFILE */}
      <div className="mb-10">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">
          Update Profile
        </h2>

        <form onSubmit={updateProfile} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black uppercase text-gray-400">
              Nama
            </label>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 border border-gray-300 px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-yellow-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase text-gray-400">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 border border-gray-300 px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-yellow-500 outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <button className="bg-yellow-500 hover:bg-yellow-600 transition text-white px-6 py-3 rounded-xl shadow-lg font-black uppercase text-sm">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

      {/* CHANGE PASSWORD */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">
          Ganti Password
        </h2>

        <form onSubmit={changePassword} className="grid md:grid-cols-3 gap-4">

        {/* PASSWORD LAMA */}
        <div>
            <label className="text-xs font-black uppercase text-gray-400">
            Password Lama
            </label>

            <div className="relative mt-1">
            <input
                type={showOldPassword ? "text" : "password"}
                autoComplete="current-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 pr-12 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                required
            />

            <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 transition"
            >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            </div>
        </div>

        {/* PASSWORD BARU */}
        <div>
            <label className="text-xs font-black uppercase text-gray-400">
            Password Baru
            </label>

            <div className="relative mt-1">
            <input
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 pr-12 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                required
            />

            <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 transition"
            >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            </div>
        </div>

        {/* KONFIRMASI PASSWORD */}
        <div>
            <label className="text-xs font-black uppercase text-gray-400">
            Konfirmasi Password
            </label>

            <div className="relative mt-1">
            <input
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 pr-12 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                required
            />

            <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 transition"
            >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            </div>
        </div>

        <div className="md:col-span-3">
            <button className="bg-red-600 hover:bg-red-700 transition text-white px-6 py-3 rounded-xl shadow-lg font-black uppercase text-sm">
            Update Password
            </button>
        </div>

        </form>
      </div>
    </div>
  );
}