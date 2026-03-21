import React from 'react';
import { Clock, Flag, Award, Calendar } from 'lucide-react'; 

const HistorySection = () => {
    
    // Data Sejarah Kunci (Ganti dengan tahun dan deskripsi aktual PelTI Denpasar)
    const historyEvents = [
        { 
            year: 2018, 
            title: "Pendirian Organisasi Resmi", 
            description: "PelTI Denpasar secara resmi dibentuk dan diakui, memulai fokus pada pembinaan atlet Junior.",
            icon: Flag 
        },
        { 
            year: 2019, 
            title: "Penyelenggaraan Turnamen Perdana", 
            description: "Turnamen tahunan pertama kali diadakan sebagai ajang seleksi bibit unggul kota.",
            icon: Calendar 
        },
        { 
            year: 2021, 
            title: "Program Intensif Atlet Muda", 
            description: "Peluncuran program pelatihan intensif khusus untuk mempersiapkan atlet menghadapi Kejurda Bali.",
            icon: Award 
        },
        { 
            year: "Saat Ini", 
            title: "Fokus Pengembangan Infrastruktur", 
            description: "Meningkatkan kerjasama dengan pemerintah kota untuk modernisasi fasilitas lapangan tenis di Denpasar.",
            icon: Clock 
        },
    ];

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-secondary">
                        Perjalanan Organisasi 
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                        Momen-momen kunci dan tonggak pencapaian yang membentuk PelTI Denpasar hingga saat ini.
                    </p>
                    <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded"></div>
                </div>

                {/* Timeline Layout */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Garis Vertikal (Hanya terlihat di desktop) */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200 hidden md:block"></div>

                    {historyEvents.map((event, index) => {
                        const IconComponent = event.icon;
                        const isLeft = index % 2 === 0;

                        return (
                            <div 
                                key={index} 
                                className={`mb-8 flex justify-between items-center w-full ${isLeft ? 'md:flex-row-reverse' : 'md:flex-row'}`}
                            >
                                {/* Konten Kiri/Kanan */}
                                <div className={`order-1 w-full md:w-5/12 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                                    <div className={`p-6 rounded-xl shadow-lg bg-gray-50 border-t-4 border-primary transition hover:shadow-xl`}>
                                        <h3 className="text-xl font-bold text-secondary mb-2">{event.title}</h3>
                                        <p className="text-gray-600 text-sm">{event.description}</p>
                                    </div>
                                </div>
                                
                                {/* Ikon Lingkaran */}
                                <div className="order-1 md:w-2/12 hidden md:block">
                                    <div className="w-10 h-10 relative bg-primary rounded-full mx-auto border-4 border-white shadow-lg flex items-center justify-center">
                                        <IconComponent className="w-5 h-5 text-white" />
                                    </div>
                                </div>

                                {/* Tahun */}
                                <div className={`order-1 w-full md:w-5/12 text-center ${isLeft ? 'md:text-left' : 'md:text-right'} p-2`}>
                                    <p className="text-2xl font-extrabold text-secondary">{event.year}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HistorySection;