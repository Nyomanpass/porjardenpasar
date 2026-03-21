import React from 'react';
import { Target, Users, Trophy, BarChart, Zap } from 'lucide-react'; 

const DetailedAboutSection = () => {

    // Data Fakta Kunci (Disajikan dalam bentuk list di sisi kanan)
    const keyFacts = [
        { icon: Users, label: "Anggota Aktif", value: "300+", unit: "Orang" },
        { icon: Trophy, label: "Turnamen Utama", value: "1x", unit: "Tahun" },
        { icon: BarChart, label: "Atlet Junior Binaan", value: "180+", unit: "Atlet" },
        { icon: Zap, label: "Klub Berafiliasi", value: "12", unit: "Klub" },
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 md:px-20">


                {/* Konten Utama (Grid Kiri-Kanan) */}
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Kolom Kiri: Penjelasan Detail Organisasi */}
                    <div className="order-2 lg:order-1 space-y-6">
                        
                        <h3 className="text-3xl font-bold text-secondary flex items-center">
                            <Target className="w-7 h-7 text-primary mr-3" /> Misi dan Komitmen Kami
                        </h3>
                        
                        <p className="text-gray-700 text-lg leading-relaxed">
                            PelTI Denpasar adalah **motor penggerak** resmi yang berfokus pada tiga pilar utama: **Pembinaan, Kompetisi, dan Pengembangan Komunitas**. Kami bekerja erat dengan klub-klub lokal dan pemerintah kota untuk memastikan setiap kebijakan mendukung pertumbuhan atlet secara holistik.
                        </p>
                        
                        <p className="text-gray-600 leading-relaxed italic border-l-4 border-yellow-400 pl-4 bg-yellow-50 p-3 rounded-md">
                            "Fokus utama kami adalah menciptakan **jalur karir** yang jelas bagi atlet, mulai dari identifikasi bibit unggul, pelatihan intensif, hingga panggung kompetisi yang dapat membawa mereka ke tingkat nasional."
                        </p>
                        
                        <ul className="space-y-3 pt-4">
                            <li className="flex items-start text-gray-700">
                                <span className="text-indigo-600 font-semibold mr-2">•</span>
                                **Pembinaan Berjenjang:** Menyediakan kurikulum yang terstruktur untuk berbagai kelompok usia.
                            </li>
                            <li className="flex items-start text-gray-700">
                                <span className="text-indigo-600 font-semibold mr-2">•</span>
                                **Seleksi Transparan:** Menyelenggarakan turnamen utama sebagai ajang seleksi yang adil dan terbuka.
                            </li>
                            <li className="flex items-start text-gray-700">
                                <span className="text-indigo-600 font-semibold mr-2">•</span>
                                **Peningkatan Fasilitas:** Berupaya meningkatkan kualitas lapangan dan sarana latihan di Denpasar.
                            </li>
                        </ul>
                    </div>

                    {/* Kolom Kanan: Visual dan Fakta Kunci */}
                    <div className="order-1 lg:order-2">
                        
                        {/* Placeholder Gambar/Visual Utama */}
                        <div className="mb-8 h-64 w-full bg-indigo-100 rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
                            
                        </div>

                        {/* Statistik Kunci (Ganti data di atas dengan angka aktual) */}
                        <div className="grid grid-cols-2 gap-4">
                            {keyFacts.map((fact, index) => {
                                const IconComponent = fact.icon;
                                return (
                                    <div 
                                        key={index} 
                                        className="p-5 bg-white rounded-xl shadow-md border-b-4 border-secondary"
                                    >
                                        <IconComponent className="w-6 h-6 text-primary mb-2" />
                                        <p className="text-3xl font-extrabold text-secondary">
                                            {fact.value}<span className="text-xl font-semibold text-secondary ml-1">{fact.unit}</span>
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">{fact.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default DetailedAboutSection;