import React, { useState } from 'react';

function ContactSection() {
    // State untuk Formulir Kontak
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // Data Kontak Resmi
    const contactInfo = [
        { icon: "map", label: "Alamat Sekretariat", value: "Jl. Hayam Wuruk No. 123, Denpasar (Komplek GOR Ngurah Rai)" },
        { icon: "phone", label: "Telepon Resmi", value: "+62 812-3456-7890" },
        { icon: "email", label: "Email Bisnis", value: "peltidenpasar.official@mail.com" },
        { icon: "time", label: "Jam Operasional", value: "Senin - Jumat: 09.00 - 16.00 WITA" },
    ];

    // Fungsi untuk mendapatkan ikon SVG
    const getIcon = (iconName) => {
        const defaultStyle = "w-8 h-8 text-white";
        switch (iconName) {
            case 'map':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={defaultStyle}>
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                );
            case 'phone':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={defaultStyle}>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6.72-6.72 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.08 2h3a2 2 0 0 1 2 1.72 17 17 0 0 0 .93 4.41 2 2 0 0 1-.72 2.15l-.26.26c-.86.86-1.14 2.1-.21 3.14a15 15 0 0 0 6.54 6.54c1.04.93 2.28.65 3.14-.21l.26-.26a2 2 0 0 1 2.15-.72A17 17 0 0 0 20.28 20a2 2 0 0 1 1.72 2.18z"></path>
                    </svg>
                );
            case 'email':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={defaultStyle}>
                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                );
            case 'time':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={defaultStyle}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                );
            default:
                return null;
        }
    }

    // Handler Perubahan Input Form
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handler Submit Form (Simulasi)
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            setIsError(true);
            setStatusMessage('Mohon lengkapi semua kolom formulir.');
            return;
        }

        setIsSubmitting(true);
        setIsError(false);
        setStatusMessage('Pesan Anda sedang dikirim...');

        // Simulasi pengiriman data (menggantikan API call/Firestore save)
        setTimeout(() => {
            setIsSubmitting(false);
            setFormData({ name: '', email: '', message: '' }); // Reset form
            setIsError(false);
            setStatusMessage('Terima kasih! Pesan Anda telah kami terima dan akan segera kami balas.');
        }, 2000); // Simulasi delay 2 detik
    };

    // Komponen Input Kustom
    const InputField = ({ label, name, type = 'text', required = true }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                id={name}
                value={formData[name]}
                onChange={handleChange}
                required={required}
                disabled={isSubmitting}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-[#D4A949] focus:border-[#D4A949] sm:text-sm transition duration-300"
            />
        </div>
    );

    // Komponen Textarea Kustom
    const TextAreaField = ({ label, name, required = true }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                name={name}
                id={name}
                rows="4"
                value={formData[name]}
                onChange={handleChange}
                required={required}
                disabled={isSubmitting}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-[#D4A949] focus:border-[#D4A949] sm:text-sm transition duration-300"
            ></textarea>
        </div>
    );

    return (
        <section id="contact" className="py-20 md:py-32 bg-gray-50">
            <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20">
                
                {/* Header Section */}
                <div className="text-center mb-16 max-w-4xl mx-auto">
                    <p className="text-xl font-semibold text-primary uppercase tracking-wider mb-2">
                    KONTAK KAMI
                    </p>
                    <h2 className="mt-4 text-4xl md:text-5xl font-extrabold text-secondary leading-tight">
                        Hubungi PELTI Kota Denpasar
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Kami siap melayani pertanyaan Anda. Pilih saluran komunikasi yang paling nyaman bagi Anda.
                    </p>
                </div>

                {/* Main Content Grid: 2 kolom di layar besar (lg) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-5">
                    
                    {/* KOLOM KIRI: Informasi Kontak Sekretariat */}
                    <div className="space-y-8 p-8 bg-white rounded-3xl shadow-xl h-fit">
                        <h3 className="text-2xl font-extrabold text-secondary mb-6 border-b pb-3">
                            Detail Kontak Sekretariat
                        </h3>
                        {contactInfo.map((item, index) => (
                            <div key={index} className="flex items-start space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
                                {/* Ikon */}
                                <div className="p-3 bg-primary rounded-xl shadow-lg flex-shrink-0 transform rotate-[-3deg] transition-transform hover:rotate-0">
                                    {getIcon(item.icon)}
                                </div>
                                {/* Konten Teks */}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium uppercase text-[#D4A949]">{item.label}</p>
                                    <p className="text-lg font-bold text-gray-800 transition-colors hover:text-[#5A4B29] break-words">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* KOLOM KANAN: Formulir Kontak */}
                    <div className="p-8 bg-white rounded-3xl shadow-xl">
                        <h3 className="text-2xl font-extrabold text-secondary mb-6 border-b pb-3">
                            Kirimkan Pesan Anda
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <InputField label="Nama Lengkap" name="name" />
                            <InputField label="Alamat Email" name="email" type="email" />
                            <TextAreaField label="Pesan atau Pertanyaan Anda" name="message" />

                            {/* Status Pesan */}
                            {statusMessage && (
                                <div className={`p-3 rounded-xl text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {statusMessage}
                                </div>
                            )}

                            {/* Tombol Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white transition duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-[#D4A949]
                                    ${isSubmitting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-primary hover:bg-[#D4A949] hover:text-white'}
                                `}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        {/* Loading spinner SVG */}
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Mengirim...
                                    </div>
                                ) : (
                                    'Kirim Pesan Sekarang'
                                )}
                            </button>
                        </form>
                    </div>

                </div>

            </div>
        </section>
    );
}

export default ContactSection;