import { Link } from 'react-router-dom'
import styles from './styles.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <h1>
        <Link to='/'>The Eternal Dance</Link>
      </h1>
      <nav>
        <ul>
          <li>
            <Link to='/about'>About</Link>
          </li>
          <li>
            <Link to='/team'>Team</Link>
          </li>
          <li>
            <Link to='/gallery'>Gallery</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
