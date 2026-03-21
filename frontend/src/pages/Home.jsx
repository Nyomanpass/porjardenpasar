import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import News from "../components/News";
import Footer from "../components/Footer";
import TournamentComming from "../components/TournamentComming";


function Home(){
    return(
        <>
            <Navbar/>
            <Hero/>
            <TournamentComming/>
            <News/>
            <Footer/>
        </>
    )
}

export default Home;