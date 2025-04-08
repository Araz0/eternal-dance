import { memo } from 'react'
import Header from '../Header/Header'
import styles from './style.module.css'

type PageContainerProps = {
  children?: React.ReactNode
}
const PageContainerRaw = ({ children }: PageContainerProps) => {
  return (
    <div className={styles.PageContainer}>
      <div className={styles.navigationWrapper}>
        <Header />
      </div>
      {children}
    </div>
  )
}

export const PageContainer = memo(PageContainerRaw)
