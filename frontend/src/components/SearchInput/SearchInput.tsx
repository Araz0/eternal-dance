import { memo } from 'react'
import { SearchIcon } from '../icons'
import styles from './style.module.css'

type SearchInputProps = {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSearchClick: () => void
}

const SearchInputRaw = ({
  searchQuery,
  setSearchQuery,
  onSearchClick,
}: SearchInputProps) => {
  return (
    <div className={styles.searchContainer}>
      <input
        type='text'
        placeholder='Search by id'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchInput}
      />
      <button onClick={onSearchClick} className={styles.searchButton}>
        <SearchIcon color='#ccc' size={22} />
      </button>
    </div>
  )
}

export const SearchInput = memo(SearchInputRaw)
