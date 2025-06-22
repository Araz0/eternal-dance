import { PageContainer } from '../components'
import FullScreenScrollReveal from '../components/FullScreenScrollComponent/FullScreenScrollComponent'
import transition from '../transition'

const Team = () => {
  return (  
    <PageContainer fixed={true} >    
        <FullScreenScrollReveal />
    </PageContainer>
  )
}

export default transition(Team)
