import { useState } from "react";
import { Trash2, Plus, Info, Trophy, Star, Users, X, AlertCircle } from "lucide-react"; 

export default function SeedingModal({ pesertaList, onClose, onSaved }) {
  const [seededPeserta, setSeededPeserta] = useState([]);
  const selectedIds = seededPeserta.map(p => p.id).filter(id => id !== null);

  // --- 1. HITUNG KAPASITAS BAGAN ---
  // Mencari angka pangkat 2 terdekat yang lebih besar atau sama dengan jumlah peserta
  const getBaganCapacity = (count) => {
    if (count <= 0) return 0;
    let capacity = 2;
    while (capacity < count) {
      capacity *= 2;
    }
    return capacity;
  };

  const maxSlot = getBaganCapacity(pesertaList.length);

  const handleChange = (index, value) => {
    const newSeeded = [...seededPeserta];
    newSeeded[index] = { ...newSeeded[index], id: Number(value) };
    setSeededPeserta(newSeeded);
  };
  
  const addSlot = () => {
    setSeededPeserta([...seededPeserta, { id: null, slot: "", isSeeded: false }]);
  };
  
  const removeSlot = (index) => {
    const newSeeded = seededPeserta.filter((_, i) => i !== index);
    setSeededPeserta(newSeeded);
  };
  
  // --- 2. VALIDASI INPUT SLOT AGAR TIDAK BABLAS ---
  const handleSlotChange = (index, value) => {
    let numValue = value === "" ? "" : Number(value);
    
    // Jika angka yang dimasukkan lebih besar dari kapasitas bagan, kunci di angka maksimal
    if (numValue > maxSlot) numValue = maxSlot;
    // Mencegah angka negatif
    if (numValue < 0) numValue = 1;

    const newSeeded = [...seededPeserta];
    newSeeded[index] = { ...newSeeded[index], slot: numValue };
    setSeededPeserta(newSeeded);
  };

  const toggleSeed = (index) => {
    const newSeeded = [...seededPeserta];
    newSeeded[index].isSeeded = !newSeeded[index].isSeeded;
    setSeededPeserta(newSeeded);
  };

  const save = () => {
    // Validasi sebelum simpan: Cek apakah ada slot duplikat
    const activeSlots = seededPeserta.filter(p => p.slot !== "");
    const slotValues = activeSlots.map(p => p.slot);
    const hasDuplicate = new Set(slotValues).size !== slotValues.length;

    const isIncomplete = seededPeserta.some(p => !p.id || !p.slot);
    if (isIncomplete) {
      alert("⚠️ Pastikan semua baris sudah memilih Peserta dan No. Slot!");
      return;
    }

    if (hasDuplicate) {
      alert("⚠️ Ada nomor slot yang duplikat! Satu slot hanya bisa diisi satu peserta.");
      return;
    }

    const finalSeeded = seededPeserta.filter(p => p.id && p.slot);
    onSaved(finalSeeded);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm z-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full h-[85vh] max-w-5xl flex flex-col overflow-hidden animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="bg-[#D4A949]/10 p-2.5 rounded-xl">
              <Trophy className="w-7 h-7 text-[#D4A949]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-2xl tracking-tight">Plotting Peserta</h3>
              <p className="text-gray-400 text-sm font-medium">
                Batas Slot Maksimal: <span className="text-[#6E332C] font-bold">Slot 1 - {maxSlot}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-8 overflow-y-auto bg-white">
          {/* Aler Info Kapasitas */}
          <div className="mb-6 flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm">
            <AlertCircle size={18} />
            <span>Sistem mendeteksi <strong>{pesertaList.length} Peserta</strong>, maka kapasitas bagan adalah <strong>{maxSlot} Slot</strong>.</span>
          </div>

          {seededPeserta.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Users className="w-12 h-12 text-gray-200 mb-2" />
              <p className="text-gray-400 font-medium">Belum ada pengaturan penempatan.</p>
              <button onClick={addSlot} className="text-[#D4A949] font-bold hover:underline">Tambah peserta sekarang</button>
            </div>
          ) : (
            <div className="space-y-4">
              {seededPeserta.map((seeded, index) => {
                const isInvalid = seeded.slot > maxSlot;
                return (
                  <div key={index} className={`flex items-center space-x-6 p-4 rounded-xl border transition-all ${seeded.isSeeded ? 'border-[#D4A949] bg-[#D4A949]/5' : 'border-gray-100'}`}>
                    
                    {/* Select Peserta */}
                    <div className="flex-[2]">
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Peserta</label>
                      <select
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-medium outline-none focus:border-[#D4A949]"
                        value={seeded.id || ""}
                        onChange={(e) => handleChange(index, e.target.value)}
                      >
                        <option value="">Pilih Peserta...</option>
                        {pesertaList.map((p) => {
                            // Cek apakah peserta ini sudah dipilih di baris LAIN
                            const isAlreadyChosen = selectedIds.includes(p.id) && seeded.id !== p.id;

                            // Jika sudah dipilih, jangan tampilkan (return null atau skip)
                            if (isAlreadyChosen) return null;

                            return (
                              <option key={p.id} value={p.id}>
                                {p.namaTim || p.namaLengkap}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                    
                    {/* Input Slot - Dengan Batasan Max */}
                    <div className="w-32">
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block text-center">No. Slot</label>
                      <input
                        type="number"
                        min="1"
                        max={maxSlot}
                        placeholder={`1-${maxSlot}`}
                        className={`w-full bg-white border rounded-lg px-3 py-2 text-xl text-center font-bold outline-none transition-all
                          ${isInvalid ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-200 text-[#6E332C] focus:border-[#D4A949]'}`}
                        value={seeded.slot || ""}
                        onChange={(e) => handleSlotChange(index, e.target.value)}
                      />
                    </div>

                    {/* Tipe Toggle */}
                    <div className="w-40 flex flex-col items-center">
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Tipe</label>
                      <button
                        onClick={() => toggleSeed(index)}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs border transition-all ${
                          seeded.isSeeded ? 'bg-[#D4A949] border-[#D4A949] text-white' : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        <Star size={14} className={seeded.isSeeded ? 'fill-white' : ''} />
                        {seeded.isSeeded ? "SEED" : "MANUAL"}
                      </button>
                    </div>

                    {/* Remove */}
                    <button onClick={() => removeSlot(index)} className="mt-4 p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          
          <button onClick={addSlot} className="w-full mt-6 py-4 border-2 border-dashed border-gray-100 text-gray-400 rounded-xl hover:border-[#D4A949] hover:text-[#D4A949] font-bold flex items-center justify-center gap-2 transition-all">
            <Plus size={20} /> Tambah Slot Baru
          </button>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3 text-xs text-gray-500 italic">
            <Info size={16} className="text-blue-500" />
            <span>Nomor slot tidak boleh lebih dari {maxSlot}.</span>
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="font-bold text-gray-400 hover:text-gray-600">Batal</button>
            <button onClick={save} className="px-8 py-3 bg-[#6E332C] hover:bg-[#522520] text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
              Simpan & Plotting
            </button>
          </div>  
        </div>
      </div>
    </div>
  );
}