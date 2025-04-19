import { memo } from 'react'

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
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        gap: '8px',
      }}
    >
      <input
        type='text'
        placeholder='Search by thumbnail URL...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          padding: '10px 14px',
          fontSize: '16px',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: '#333', // dark background
          color: '#eee',
          outline: 'none',
          width: '300px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        }}
      />
      <button
        onClick={onSearchClick}
        style={{
          padding: '10px 16px',
          fontSize: '16px',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: '#555', // maintain dark theme
          color: '#fff',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#666')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#555')}
      >
        Search
      </button>
    </div>
  )
}

export const SearchInput = memo(SearchInputRaw)
