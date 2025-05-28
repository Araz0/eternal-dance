import { PageContainer } from '../components'
import TeamComponent from '../components/TeamComponent/TeamComponent'
import Footer from '../components/Footer/Footer'
import transition from '../transition'

const Team = () => {
  return (  
    <PageContainer>    
        <TeamComponent />
        <Footer />
    </PageContainer>
  )
}

export default transition(Team)
