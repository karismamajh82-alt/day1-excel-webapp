import React, { useState, useMemo } from 'react'

const PAGE_SIZES = [10, 20, 50, 100]

function SortIcon({ dir }) {
  if (!dir) return <span className="th-sort-icon-dim">⇅</span>
  return <span className="th-sort-icon">{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function DataTable({ data }) {
  const { headers, rows, textCols, colTypes } = data

  const [search,   setSearch]   = useState('')
  const [filters,  setFilters]  = useState({})
  const [sortCol,  setSortCol]  = useState(null)
  const [sortDir,  setSortDir]  = useState('asc')
  const [page,     setPage]     = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Filter dropdowns for text columns with ≤40 unique values
  const filterOptions = useMemo(() => {
    const opts = {}
    textCols.forEach((col) => {
      const vals = [...new Set(rows.map((r) => String(r[col] ?? '')).filter(Boolean))].sort()
      if (vals.length <= 40) opts[col] = vals
    })
    return opts
  }, [rows, textCols])

  const filtered = useMemo(() => {
    let result = rows

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((row) =>
        headers.some((h) => String(row[h] ?? '').toLowerCase().includes(q))
      )
    }

    Object.entries(filters).forEach(([col, val]) => {
      if (val) result = result.filter((row) => String(row[col] ?? '') === val)
    })

    if (sortCol) {
      const isNum = colTypes[sortCol] === 'numeric'
      result = [...result].sort((a, b) => {
        const va = isNum
          ? parseFloat(String(a[sortCol]).replace(/[,\s]/g, '')) || 0
          : String(a[sortCol] ?? '')
        const vb = isNum
          ? parseFloat(String(b[sortCol]).replace(/[,\s]/g, '')) || 0
          : String(b[sortCol] ?? '')
        if (va < vb) return sortDir === 'asc' ? -1 : 1
        if (va > vb) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [rows, search, filters, sortCol, sortDir, headers, colTypes])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const pageData   = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortCol(col); setSortDir('asc') }
    setPage(1)
  }

  const handleFilter = (col, val) => {
    setFilters((f) => ({ ...f, [col]: val }))
    setPage(1)
  }

  const clearAll = () => {
    setSearch('')
    setFilters({})
    setSortCol(null)
    setPage(1)
  }

  const activeCount = (search ? 1 : 0) + Object.values(filters).filter(Boolean).length
  const rangeStart  = (page - 1) * pageSize + 1
  const rangeEnd    = Math.min(page * pageSize, filtered.length)

  // Page number range
  const pageNums = useMemo(() => {
    const total = totalPages
    const start = Math.max(1, Math.min(page - 4, total - 8))
    return Array.from({ length: Math.min(9, total) }, (_, i) => start + i)
  }, [page, totalPages])

  return (
    <div className="table-wrap">

      {/* Controls */}
      <div className="table-controls">
        <div className="table-controls-left">
          <span className="table-section-label">데이터</span>
          <span className={`table-count-badge${activeCount > 0 ? ' is-filtered' : ''}`}>
            {filtered.length.toLocaleString('ko-KR')} / {rows.length.toLocaleString('ko-KR')} 건
          </span>
        </div>

        <div className="table-controls-right">
          {/* Search */}
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="전체 검색..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>

          {/* Column filter dropdowns */}
          {Object.entries(filterOptions).map(([col, opts]) => (
            <select
              key={col}
              className={`tbl-select${filters[col] ? ' is-active' : ''}`}
              value={filters[col] || ''}
              onChange={(e) => handleFilter(col, e.target.value)}
            >
              <option value="">{col} — 전체</option>
              {opts.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          ))}

          {activeCount > 0 && (
            <button className="btn-clear-filter" onClick={clearAll}>
              초기화
            </button>
          )}

          <select
            className="tbl-pagesize"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}행씩</option>
            ))}
          </select>
        </div>
      </div>

      {/* Meta row */}
      {filtered.length > 0 && (
        <div className="table-meta-row">
          {filtered.length.toLocaleString('ko-KR')}건 중{' '}
          {rangeStart.toLocaleString('ko-KR')}–{rangeEnd.toLocaleString('ko-KR')}건 표시
          {activeCount > 0 && <span className="filter-active-label"> · 필터 적용 중</span>}
        </div>
      )}

      {/* Table */}
      <div className="tbl-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className={`${colTypes[h] === 'numeric' ? 'th-num' : 'th-txt'}${sortCol === h ? ' is-sort-active' : ''}`}
                  onClick={() => handleSort(h)}
                >
                  {h}
                  <SortIcon dir={sortCol === h ? sortDir : null} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="td-empty">
                  검색 결과가 없습니다
                </td>
              </tr>
            ) : (
              pageData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'tr-even' : 'tr-odd'}>
                  {headers.map((h) => (
                    <td
                      key={h}
                      className={colTypes[h] === 'numeric' ? 'td-num' : 'td-txt'}
                    >
                      {String(row[h] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
          <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>

          {pageNums.map((p) => (
            <button
              key={p}
              className={`page-btn${p === page ? ' is-active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}

          <button className="page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
          <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
        </div>
      )}
    </div>
  )
}
