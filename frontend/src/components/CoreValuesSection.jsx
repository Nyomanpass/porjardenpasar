import React from 'react';
import { Shield, Zap, Handshake, Heart } from 'lucide-react'; 

const CoreValuesSection = () => {
    
    // Data Nilai Inti PelTI Denpasar
    const coreValues = [
        { 
            icon: Shield, 
            title: "Integritas & Sportivitas", 
            description: "Menjunjung tinggi kejujuran, etika bermain, dan menghormati lawan dalam setiap kompetisi." 
        },
        { 
            icon: Zap, 
            title: "Dedikasi Prestasi", 
            description: "Komitmen penuh terhadap latihan, disiplin, dan upaya berkelanjutan untuk mencapai hasil terbaik." 
        },
        { 
            icon: Handshake, 
            title: "Kolaborasi Komunitas", 
            description: "Membangun sinergi yang kuat antara atlet, pelatih, klub, dan mitra untuk kemajuan bersama." 
        },
        { 
            icon: Heart, 
            title: "Pengembangan Karakter", 
            description: "Fokus tidak hanya pada kemampuan teknis, tetapi juga pada pembentukan pribadi yang tangguh, rendah hati, dan bermental juara." 
        },
    ];

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4 md:px-20">
                
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-secondary">
                        Nilai Inti yang Kami Pegang
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                        Filosofi yang memandu setiap program pembinaan dan aktivitas PelTI Denpasar.
                    </p>
                    <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded"></div>
                </div>

                {/* Grid Nilai Inti */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {coreValues.map((value, index) => {
                        const IconComponent = value.icon;
                        return (
                            <div 
                                key={index} 
                                className="text-center p-6 bg-primary/10 rounded-xl shadow-md border-b-4 border-primary transition hover:shadow-xl"
                            >
                                {/* Ikon Besar */}
                                <IconComponent className="w-12 h-12 text-secondary mx-auto mb-4" />
                                
                                {/* Judul Nilai */}
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {value.title}
                                </h3>
                                
                                {/* Deskripsi Nilai */}
                                <p className="text-sm text-gray-600">
                                    {value.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CoreValuesSection;