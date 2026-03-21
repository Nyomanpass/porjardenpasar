import { useEffect, useState } from "react";

function MatchPage() {
  const [match, setMatch] = useState([]);
  const [form, setForm] = useState({
    pesertaA: "",
    pesertaB: "",
    pemenang: "",
    round: "",
  });

  const getMatch = async () => {
    const res = await fetch("http://localhost:5000/api/match");
    const data = await res.json();
    setMatch(data);
  };

  useEffect(() => {
    getMatch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ pesertaA: "", pesertaB: "", pemenang: "", round: "" });
    getMatch();
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Match</h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
        <input
          placeholder="Peserta A"
          value={form.pesertaA}
          onChange={(e) => setForm({ ...form, pesertaA: e.target.value })}
          className="border p-1"
        />
        <input
          placeholder="Peserta B"
          value={form.pesertaB}
          onChange={(e) => setForm({ ...form, pesertaB: e.target.value })}
          className="border p-1"
        />
        <input
          placeholder="Pemenang"
          value={form.pemenang}
          onChange={(e) => setForm({ ...form, pemenang: e.target.value })}
          className="border p-1"
        />
        <input
          placeholder="Round"
          value={form.round}
          onChange={(e) => setForm({ ...form, round: e.target.value })}
          className="border p-1"
        />
        <button className="bg-purple-500 text-white px-2">Tambah</button>
      </form>

      <ul className="mt-4">
        {match.map((m) => (
          <li key={m.id}>
            {m.pesertaA} vs {m.pesertaB} → Pemenang: {m.pemenang} (Round {m.round})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MatchPage;
