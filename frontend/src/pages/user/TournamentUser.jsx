import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import TournamentComming from "../../components/TournamentComming";
import TournamentArchive from "../../components/TournamentArchive";
import TournamentCTA from "../../components/TournamentCTA";

function TournamentUser() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <div className="relative w-full h-[400px] mt-18">
        <img
          src="/hero.jpg"
          alt="Kepengurusan Pelti Denpasar"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50"></div>

        <div
          className="
            absolute inset-0
            flex flex-col items-center justify-center
            px-4 sm:px-6 md:px-10 lg:px-20
            text-center text-white
          "
        >
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-3 leading-tight">
            Jadwal Turnamen Mendatang
          </h2>

          <p
            className="
              max-w-md sm:max-w-xl md:max-w-2xl
              text-xs sm:text-sm md:text-base
              opacity-90 leading-relaxed
            "
          >
            Panggung resmi untuk membuktikan kualitas atlet, meraih poin ranking kota,
            dan mengikuti seleksi menuju kejuaraan provinsi
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <TournamentComming />
      <TournamentArchive />
      <TournamentCTA />

      <Footer />
    </>
  );
}

export default TournamentUser;
