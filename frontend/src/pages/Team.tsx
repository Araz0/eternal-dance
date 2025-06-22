import { PageContainer } from '../components'
import Footer from '../components/Footer/Footer'
import transition from '../transition'
import FullScreenScrollReveal from '../components/FullScreenScrollComponent/FullScreenScrollComponent'

const Team = () => {
  return (  
    <PageContainer>    
        <FullScreenScrollReveal />
    </PageContainer>
  )
}

export default transition(Team)
