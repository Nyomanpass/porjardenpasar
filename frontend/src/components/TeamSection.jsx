import React from 'react';
import { Crown, Briefcase, MapPin, Users, TrendingUp, Handshake } from 'lucide-react'; 

const TeamSection = () => {
    
    // Data Pengurus Inti (Ganti dengan data, foto, dan ikon yang sesuai)
    const boardMembers = [
        {
            name: "Dr. I Made Surya Dharma, S.H.",
            position: "Ketua Umum PelTI Denpasar",
            role: "Memimpin strategi organisasi, mewakili PelTI dalam hubungan eksternal, dan mengawasi seluruh program kerja.",
            photo: "photo-ketua.jpg",
            icon: Crown 
        },
        {
            name: "Ni Putu Ayu Wulandari, M.M.",
            position: "Sekretaris Jenderal",
            role: "Mengelola administrasi, dokumentasi, dan menjamin kelancaran komunikasi internal serta eksternal organisasi.",
            photo: "photo-sekretaris.jpg",
            icon: Briefcase 
        },
        {
            name: "Drs. Wayan Kerta",
            position: "Bendahara Utama",
            role: "Bertanggung jawab penuh atas manajemen keuangan, pelaporan dana, dan audit internal organisasi.",
            photo: "photo-bendahara.jpg",
            icon: MapPin 
        },
        {
            name: "Budi Santoso, M.Pd.",
            position: "Kabid Pembinaan Prestasi",
            role: "Merancang kurikulum pelatihan, melakukan seleksi atlet muda, dan monitoring kemajuan prestasi.",
            photo: "photo-kabbid_prestasi.jpg",
            icon: TrendingUp 
        },
        {
            name: "Komang Adi Wijaya",
            position: "Kabid Hubungan Masyarakat",
            role: "Menjaga citra organisasi, mengelola media sosial, dan membangun kerjasama dengan media massa lokal.",
            photo: "photo-kabbid_humas.jpg",
            icon: Handshake 
        },
    ];

    return (
        <section className="py-16 bg-gray-100">
            <div className="container mx-auto px-4 md:px-20">
                
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-secondary">
                       Kepengurusan dan Struktur Inti
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                        Mengenal para pemimpin yang berdedikasi memajukan olahraga tenis lapangan di Kota Denpasar.
                    </p>
                    <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded"></div>
                </div>

                {/* Grid Anggota Tim */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {boardMembers.map((member, index) => {
                        const IconComponent = member.icon;
                        return (
                            <div 
                                key={index} 
                                className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-secondary flex flex-col items-center text-center transition transform hover:shadow-2xl hover:-translate-y-1"
                            >
                                {/* Photo Placeholder (Harus diganti dengan tag <img> asli) */}
                                <div className="w-28 h-28 bg-gray-200 rounded-full mb-4 overflow-hidden shadow-md">
                                    
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                    {member.name}
                                </h3>
                                
                                {/* Posisi */}
                                <p className="text-secondary font-semibold mb-3 mt-1 flex items-center justify-center text-sm">
                                 {member.position}
                                </p>
                                
                                {/* Deskripsi Peran */}
                                <p className="text-sm text-gray-600 italic">
                                    {member.role}
                                </p>
                            </div>
                        );
                    })}
                </div>
            

            </div>
        </section>
    );
};

export default TeamSection;