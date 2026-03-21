// File: src/components/BaganSelectorParent.jsx

import React, { useState } from 'react';
import { ChevronsRight } from 'lucide-react';
import BaganPage from '../pages/BaganPage';
import BaganView from '../pages/BaganView';

export default function BaganSelectorParent({ tournamentId }) {
    const [selectedBaganId, setSelectedBaganId] = useState(null);

    // Jika ID bagan sudah terpilih, tampilkan BaganView
    if (selectedBaganId) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedBaganId(null)}
                    className="flex items-center text-yellow-600 hover:text-yellow-800 font-semibold mb-4 text-base sm:text-lg px-2 sm:px-4 py-2 rounded-lg transition"
                >
                    <ChevronsRight size={18} className="rotate-180 mr-1 flex-shrink-0" />
                Daftar Bagan
                </button>

                {/* Konten bagan scrollable horizontal jika perlu */}
             
                    <BaganView baganId={selectedBaganId} />
               
            </div>
        );
    }

    // Jika belum ada ID bagan yang terpilih, tampilkan daftar BaganPage
    return (
        <div className="overflow-x-auto">
            <BaganPage
                onSelectBagan={setSelectedBaganId}
                tournamentId={tournamentId}
            />
        </div>
    );
}
