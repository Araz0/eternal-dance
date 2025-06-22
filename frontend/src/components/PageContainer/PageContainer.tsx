import { memo } from 'react'
import Header from '../Header/Header'
import styles from './style.module.css'

type PageContainerProps = {
  children?: React.ReactNode
  fixed?: boolean
}
const PageContainerRaw = ({ children, fixed }: PageContainerProps) => {
  return (
    <div className={styles.PageContainer}>
      <div className={fixed ? styles.navigationWrapperFixed : styles.navigationWrapper}>
        <Header />
      </div>
      {children}
    </div>
  )
}

export const PageContainer = memo(PageContainerRaw)
