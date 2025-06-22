import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import ImprintContent from "../components/Imprint/Imprint";
import transition from "../transition";

const Imprint = () => {
    return (
        <>
        <Header />
        <ImprintContent />
        <Footer />
    </>
    )
}

export default transition(Imprint);